import {
    AddChunkData,
    FinishedData,
    MessageData,
    MessageType,
    ProcessedData,
    SetupData
} from './worker/main/interface';

import {
    Column,
    buildColumn
} from './types/column/column';

import {
    RejectCallback,
    ResolveCallback,
    TypeDeductionCallback,
    UpdateCallback
} from './types/callbacks';

import {
    inferType,
    lowestType
} from './helper/inferType';

import { ColumnTypes } from './types/interface/dataType';
import { CsvLoaderOptions } from './types/options';
import { parse } from './helper/parse';
import { splitLine } from './helper/splitLine';

export class Loader {
    protected static readonly TargetNumWorkers = 25;

    protected _stream: ReadableStream;
    protected _options: CsvLoaderOptions;
    protected _updateCb?: UpdateCallback;
    protected _typesCb: TypeDeductionCallback;
    protected _resolveCb: ResolveCallback;
    protected _rejectCb: RejectCallback;

    protected _reader: ReadableStreamDefaultReader<Uint8Array>;
    protected _types: ColumnTypes;
    protected _columns: Column[];
    protected _worker: Worker;

    public constructor(
        stream: ReadableStream,
        options: CsvLoaderOptions,
        updateCb: UpdateCallback,
        typesCb: TypeDeductionCallback
    ) {
        this._stream = stream;
        this._options = options;
        this._updateCb = updateCb;
        this._typesCb = typesCb;
    }

    protected read(): void {
        this._reader = this._stream.getReader();
        this._reader.read().then(this.readChunk.bind(this));
    }

    protected readChunk(
        result: ReadableStreamDefaultReadResult<Uint8Array>
    ): void {
        if (result.done) {
            console.log('stream ended');
            return;
        }

        if (!result.value) {
            console.log('received no data');
            this._rejectCb('No data');
            return;
        }

        const v = result.value;
        if (this._columns === undefined) {
            this.setupColumns(v.buffer);
            this._resolveCb(this._columns);
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

        this._worker.postMessage(msg);

        console.log(`received ${v.length} bytes`);

        this._reader.read().then(this.readChunk.bind(this));
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
        console.log('main worker sent chunks', data.chunks[0].length);
    }

    protected onFinished(data: FinishedData): void {
        console.log('main worker finished');
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
        // this._resolve([buildColumn('none', DataType.Number)]);
    }
}
