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

import type {
    ColumnHeader,
    ColumnsHandler,
    DataHandler,
    DoneHandler,
    ErrorHandler,
} from './types/handlers';

export class Loader {
    protected static readonly TargetNumWorkers = 25;

    protected _stream: ReadableStream;
    protected _buffer: ArrayBufferLike;
    protected _options: CsvLoaderOptions;

    protected _onColumns: ColumnsHandler;
    protected _onData: DataHandler;
    protected _onDone: DoneHandler;
    protected _onError: ErrorHandler;

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

    protected readStreamFirstChunk(): void {
        this.setupColumns();
        this.setupWorker();

        const acd: AddChunkData = {
            chunk: this._firstChunk,
        };

        const msg: MessageData = {
            type: MessageType.AddChunk,
            data: acd,
        };

        this._worker.postMessage(msg, [this._firstChunk]);
        this._firstChunk = undefined;

        this._reader.read().then(this.readStream.bind(this));
    }

    protected readStream(result: ReadableStreamDefaultReadResult<Uint8Array>): void {
        if (result.done) {
            if (this._options.verbose) console.log('stream ended');
            this.sendNoMoreChunks();
            return;
        }

        if (!result.value) {
            if (this._options.verbose) console.log('received no data');
            this._onError(this.#openedSourceId, 'No data');
            return;
        }

        const acd: AddChunkData = {
            chunk: result.value.buffer,
        };

        const msg: MessageData = {
            type: MessageType.AddChunk,
            data: acd,
        };

        this._worker.postMessage(msg, [result.value.buffer]);

        this._reader.read().then(this.readStream.bind(this));
    }

    protected openBuffer(): ColumnHeader[] {
        return this.detectTypes(this._buffer);
    }

    protected readBuffer(): void {
        this.setupColumns();
        this.setupWorker();

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

    protected setupColumns(): void {
        this._columns = [
            ...this._types.columns.map((t, i) =>
                buildColumn(
                    this._options.includesHeader ? this._firstChunkSplit[0][i] : `Column ${i}`,
                    t
                )
            ),
            ...this._types.generatedColumns.map((t) => buildColumn(t.name, t.type)),
        ];
        this._firstChunkSplit = undefined;
        this._onColumns(this.#openedSourceId, this._columns);
    }

    protected setupWorker(): void {
        this._worker = new Worker(
            // @ts-expect-error The path to the worker source is only during build.
            new URL(__MAIN_WORKER_SOURCE, import.meta.url),
            { type: 'module' }
        );

        this._worker.onmessage = (e: MessageEvent<MessageData>) => {
            const msg = e.data;
            switch (msg.type) {
                case MessageType.Processed:
                    this.onProcessed(msg.data as ProcessedData);
                    break;
                case MessageType.Finished:
                    this.onFinished(msg.data as FinishedData);
                    this._worker.terminate();
                    break;
                default:
                    if (this._options.verbose)
                        console.log('received invalid msg from main worker:', msg);
                    break;
            }
        };

        const setup: SetupData = {
            columns: this._types.columns,
            generatedColumns: this._types.generatedColumns,
            options: {
                delimiter: this._options.delimiter,
                includesHeader: this._options.includesHeader,
                verbose: this._options.verbose,
            },
        };

        const msg: MessageData = {
            type: MessageType.Setup,
            data: setup,
        };

        this._worker.postMessage(msg);
    }

    protected onProcessed(data: ProcessedData): void {
        const chunks = data.chunks.map((c) => rebuildChunk(c));
        this._columns.forEach((c, i) => c.push(chunks[i] as AnyChunk));
        this._onData(this.#openedSourceId, this._columns[0].length);
    }

    protected onFinished(data: FinishedData): void {
        if (this._options.verbose) console.log('main worker finished');
        this._perfMon.stop(`${this.#openedSourceId}-load`);
        data.performance = [...this._perfMon.samples, ...data.performance];
        this._onDone(this.#openedSourceId, data);

        // Clear data for next data source
        this._buffer = null;
        this._stream = null;
        this.#openedSourceId = null;
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

    public load(): void {
        this._perfMon.start(`${this.#openedSourceId}-load`);
        if (this._stream) {
            this.readStreamFirstChunk();
        } else {
            this.readBuffer();
        }
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

    public set onColumns(handler: ColumnsHandler) {
        this._onColumns = handler;
    }

    public set onData(handler: DataHandler) {
        this._onData = handler;
    }

    public set onDone(handler: DoneHandler) {
        this._onDone = handler;
    }

    public set onError(handler: ErrorHandler) {
        this._onError = handler;
    }
}
