import {
    AddChunkData,
    FinishedData,
    MessageData,
    MessageType,
    NoMoreChunksData,
    ProcessedData,
    SetupData
} from './worker/main/interface';

import {
    AnyChunk,
    rebuildChunk
} from './types/chunk/chunk';

import {
    Column,
    buildColumn
} from './types/column/column';

import {
    ColumnsHandler,
    DataHandler,
    DoneHandler,
    ErrorHandler,
    OpenedHandler
} from './types/callbacks';

import {
    inferType,
    lowestType
} from './helper/inferType';

import { ColumnTypes } from './types/dataType';
import { CsvLoaderOptions } from './types/options';
import { parse } from './helper/parseChunks';
import { splitLine } from './helper/splitLine';

export class Loader {
    protected static readonly TargetNumWorkers = 25;

    protected _stream: ReadableStream;
    protected _buffer: ArrayBufferLike;
    protected _options: CsvLoaderOptions;

    protected _onOpened: OpenedHandler;
    protected _onColumns: ColumnsHandler;
    protected _onData: DataHandler;
    protected _onDone: DoneHandler;
    protected _onError: ErrorHandler;

    protected _reader: ReadableStreamDefaultReader<Uint8Array>;
    protected _types: ColumnTypes;
    protected _columns: Column[];
    protected _worker: Worker;

    protected read(): void {
        if(this._stream) {
            this._reader = this._stream.getReader();
            this._reader.read().then(this.readChunk.bind(this));
        } else {
            this.readBuffer();
        }
    }

    protected readChunk(
        result: ReadableStreamDefaultReadResult<Uint8Array>
    ): void {
        if (result.done) {
            console.log('stream ended');
            this.sendNoMoreChunks();
            return;
        }

        if (!result.value) {
            console.log('received no data');
            this._onError('No data');
            return;
        }

        const v = result.value;
        if (this._columns === undefined) {
            this.setupColumns(v.buffer);
            this._onColumns(this._columns);
        }

        if (this._worker === undefined) {
            this.setupWorker();
        }

        const acd: AddChunkData = {
            chunk: v.buffer
        };

        const msg: MessageData = {
            type: MessageType.AddChunk,
            data: acd
        };

        this._worker.postMessage(msg, [v.buffer]);

        this._reader.read().then(this.readChunk.bind(this));
    }

    protected readBuffer(): void {
        this.setupColumns(this._buffer);
        this._onColumns(this._columns);
        this.setupWorker();

        this._worker.postMessage({
            type: MessageType.AddChunk,
            data: { chunk: this._buffer }
        }, [this._buffer]);

        this._worker.postMessage({
            type: MessageType.NoMoreChunks,
            data: {}
        });
    }

    protected sendNoMoreChunks(): void {
        const data: NoMoreChunksData = {};

        const msg: MessageData = {
            type: MessageType.NoMoreChunks,
            data: data
        };

        this._worker.postMessage(msg);
    }

    protected setupColumns(chunk: ArrayBufferLike): void {
        const lines = parse(
            [chunk],
            { chunk: 0, char: 0 },
            { chunk: 0, char: chunk.byteLength });

        const split = lines.map((l) => splitLine(l, this._options.delimiter));

        const inferStart = +this._options.includesHeader;
        const inferLines = split.slice(
            inferStart,
            Math.max(inferStart + this._options.typeInferLines, split.length));

        const detectedTypes = inferLines
            .map((l) => l.map((c) => inferType(c)))
            .reduce((prev, cur) => prev.map((p, i) => lowestType(p, cur[i])));

        // TODO: func has to be split up - up to here in open(), then load()
        this._types = this._typesCb(detectedTypes);
        this._columns = [
            ...this._types.columns.map((t, i) => buildColumn(
                this._options.includesHeader ? split[0][i] : `Column ${i}`, t)),
            ...this._types.generatedColumns.map((t) => buildColumn(
                t.name, t.type))
        ];
    }

    protected setupWorker(): void {
        // @ts-expect-error The path to the worker source is only during build.
        this._worker = new Worker(MAIN_WORKER_SOURCE);

        this._worker.onmessage = (e: MessageEvent<MessageData>) => {
            const msg = e.data;
            switch (msg.type) {
                case MessageType.Processed:
                    this.onProcessed(msg.data as ProcessedData);
                    break;
                case MessageType.Finished:
                    this.onFinished(msg.data as FinishedData);
                    break;
                default:
                    console.log('received invalid msg from main worker:', msg);
                    break;
            }
        };

        const setup: SetupData = {
            columns: this._types.columns,
            generatedColumns: this._types.generatedColumns,
            options: {
                delimiter: this._options.delimiter,
                includesHeader: this._options.includesHeader
            }
        };

        const msg: MessageData = {
            type: MessageType.Setup,
            data: setup
        };

        this._worker.postMessage(msg);
    }

    protected onProcessed(data: ProcessedData): void {
        const chunks = data.chunks.map((c) => rebuildChunk(c));
        this._columns.forEach((c, i) => c.push(chunks[i] as AnyChunk));
        this._updateCb(chunks[0].length);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onFinished(data: FinishedData): void {
        console.log('main worker finished');
        this._updateCb(Number.POSITIVE_INFINITY);
    }

    public set resolve(resolve: ResolveCallback) {
        this._resolveCb = resolve;
    }

    public set reject(resolve: RejectCallback) {
        this._rejectCb = resolve;
    }

    public load(): void {
        if (this._options.delimiter === undefined) {
            this._rejectCb(
                'Delimiter not specified nor deductible from filename.');
        }

        this.read();
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

    public set onOpened(handler: OpenedHandler) {
        this._onOpened = handler;
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
