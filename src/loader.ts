import { inferType, lowestType } from './helper/inferType';
import { parse } from './helper/parseChunks';
import { PerfMon } from './helper/perfMon';
import { splitLine } from './helper/splitLine';
import { AnyChunk, rebuildChunk } from './types/chunk/chunk';
import { buildColumn, Column } from './types/column/column';
import { ColumnTypes } from './types/dataType';
import { CsvLoaderOptions } from './types/options';
import {
    AddChunkData,
    FinishedData,
    MessageData,
    MessageType,
    NoMoreChunksData,
    ProcessedData,
    SetupData,
} from './worker/main/interface';

import type { ColumnHeader, Dispatcher, DispatchValue, LoadStatistics } from './types/handlers';

export class Loader {
    protected static readonly TargetNumWorkers = 25;

    protected _stream: ReadableStream;
    protected _buffer: ArrayBufferLike;
    protected _options: CsvLoaderOptions;

    protected _reader: ReadableStreamDefaultReader<Uint8Array>;
    protected _firstChunk: ArrayBuffer;
    protected _firstChunkSplit: string[][];
    protected _types: ColumnTypes;
    protected _columns: Column[];
    protected _worker: Worker;
    protected _perfMon = new PerfMon();

    #openedSourceId: string;

    protected openStream(result: ReadableStreamDefaultReadResult<Uint8Array>): ColumnHeader[] {
        if (!result.value) {
            if (this._options.verbose) console.log('received no data');
            throw new Error('No data');
        }

        this._firstChunk = result.value.buffer;

        return this.detectTypes(result.value);
    }

    protected async readStreamFirstChunk(): Promise<void> {
        const acd: AddChunkData = {
            chunk: this._firstChunk,
        };

        const msg: MessageData = {
            type: MessageType.AddChunk,
            data: acd,
        };

        this._worker.postMessage(msg, [this._firstChunk]);
        this._firstChunk = undefined;

        const result = await this._reader.read();

        await this.readStream(result);
    }

    protected async readStream(result: ReadableStreamDefaultReadResult<Uint8Array>): Promise<void> {
        if (result.done) {
            if (this._options.verbose) console.log('stream ended');
            this.sendNoMoreChunks();
            return;
        }

        if (!result.value) {
            if (this._options.verbose) console.log('received no data');
            throw new Error('No data');
        }

        const acd: AddChunkData = {
            chunk: result.value.buffer,
        };

        const msg: MessageData = {
            type: MessageType.AddChunk,
            data: acd,
        };

        this._worker.postMessage(msg, [result.value.buffer]);

        const nextResult = await this._reader.read();

        await this.readStream(nextResult);
    }

    protected openBuffer(): ColumnHeader[] {
        return this.detectTypes(this._buffer);
    }

    protected readBuffer(): void {
        this._worker.postMessage(
            {
                type: MessageType.AddChunk,
                data: { chunk: this._buffer },
            },
            [this._buffer]
        );

        this._worker.postMessage({
            type: MessageType.NoMoreChunks,
            data: {},
        });
    }

    protected sendNoMoreChunks(): void {
        const data: NoMoreChunksData = {};

        const msg: MessageData = {
            type: MessageType.NoMoreChunks,
            data: data,
        };

        this._worker.postMessage(msg);
    }

    protected detectTypes(chunk: ArrayBufferLike): ColumnHeader[] {
        const lines = parse([chunk], { chunk: 0, char: 0 }, { chunk: 0, char: chunk.byteLength });

        this._firstChunkSplit = lines.map((l) => splitLine(l, this._options.delimiter));

        const inferStart = +this._options.includesHeader;
        const inferLines = this._firstChunkSplit.slice(
            inferStart,
            Math.max(inferStart + this._options.typeInferLines, this._firstChunkSplit.length)
        );

        const detectedTypes = inferLines
            .map((lines) => lines.map((columns) => inferType(columns)))
            .reduce((prev, cur) => prev.map((type, index) => lowestType(type, cur[index])));

        const headers = detectedTypes.map<ColumnHeader>((type, index) => ({
            name: this._options.includesHeader ? this._firstChunkSplit[0][index] : '',
            type,
        }));

        this._perfMon.stop(`${this.#openedSourceId}-open`);

        return headers;
    }

    protected setupColumns(): Column[] {
        this._columns = [
            ...this._types.columns.map((type, index) =>
                buildColumn(
                    this._options.includesHeader
                        ? this._firstChunkSplit[0][index]
                        : `Column ${index}`,
                    type
                )
            ),
            ...this._types.generatedColumns.map(({ name, type }) => buildColumn(name, type)),
        ];
        this._firstChunkSplit = undefined;

        return this._columns;
    }

    protected setupWorker(): ReadableStream<DispatchValue> {
        class WorkerSource {
            public constructor(private readonly loader: Loader) {}

            public start(controller: ReadableStreamController<DispatchValue>): void {
                this.loader._worker = new Worker(
                    // @ts-expect-error The path to the worker source is only during build.
                    new URL(__MAIN_WORKER_SOURCE, import.meta.url),
                    { type: 'module' }
                );

                this.loader._worker.onmessage = (event: MessageEvent<MessageData>) => {
                    const message = event.data;
                    switch (message.type) {
                        case MessageType.Processed:
                            controller.enqueue({
                                type: 'data',
                                progress: this.loader.onProcessed(message.data as ProcessedData),
                            });
                            break;
                        case MessageType.Finished:
                            controller.enqueue({
                                type: 'done',
                                statistics: this.loader.onFinished(message.data as FinishedData),
                            });
                            this.loader._worker.terminate();
                            controller.close();
                            break;
                        default:
                            if (this.loader._options.verbose)
                                console.log('received invalid msg from main worker:', message);

                            controller.error(['received invalid msg from main worker:', message]);
                            break;
                    }
                };

                const setup: SetupData = {
                    columns: this.loader._types.columns,
                    generatedColumns: this.loader._types.generatedColumns,
                    options: {
                        delimiter: this.loader._options.delimiter,
                        includesHeader: this.loader._options.includesHeader,
                        verbose: this.loader._options.verbose,
                    },
                };
                const message: MessageData = {
                    type: MessageType.Setup,
                    data: setup,
                };

                this.loader._worker.postMessage(message);
            }
        }

        return new ReadableStream(new WorkerSource(this));
    }

    protected onProcessed(data: ProcessedData): number {
        const chunks = data.chunks.map((chunk) => rebuildChunk(chunk));
        this._columns.forEach((column, index) => column.push(chunks[index] as AnyChunk));

        return this._columns[0].length;
    }

    protected onFinished(data: FinishedData): LoadStatistics {
        if (this._options.verbose) console.log('main worker finished');

        this._perfMon.stop(`${this.#openedSourceId}-load`);
        data.performance = [...this._perfMon.samples, ...data.performance];

        // Clear data for next data source
        this._buffer = null;
        this._stream = null;
        this.#openedSourceId = null;

        return data;
    }

    public async open(id: string): Promise<ColumnHeader[]> {
        if (this._options.delimiter === undefined) {
            throw new Error('Delimiter not specified nor deductible from filename.');
        }

        this.#openedSourceId = id;
        this._perfMon.start(`${id}-open`);

        if (this._stream) {
            this._reader = this._stream.getReader();
            const result = await this._reader.read();

            return this.openStream(result);
        } else {
            return this.openBuffer();
        }
    }

    public load(): [Column[], Dispatcher] {
        this._perfMon.start(`${this.#openedSourceId}-load`);

        const columns = this.setupColumns();
        const resultStream = this.setupWorker();
        const dispatch = async function* (): AsyncGenerator<DispatchValue, void> {
            const reader = resultStream.getReader();

            while (true) {
                const { done, value } = await reader.read();

                if (done) return;

                yield value;
            }
        };

        if (this._stream) {
            this.readStreamFirstChunk();
        } else {
            this.readBuffer();
        }

        return [columns, dispatch];
    }

    public set stream(stream: ReadableStream) {
        this._stream = stream;
    }

    public set buffer(buffer: ArrayBufferLike) {
        this._buffer = buffer;
    }

    public set options(options: CsvLoaderOptions) {
        this._options = options;
    }

    public set types(columns: ColumnTypes) {
        this._types = columns;
    }
}
