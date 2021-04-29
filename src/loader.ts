import {
    RejectCallback,
    ResolveCallback,
    TypeDeductionCallback,
    UpdateCallback
} from "./types/callbacks";

import {
    buildColumn,
    Column
} from "./types/column/column";

import { CsvLoaderOptions } from "./types/options";
import { DataType } from "./types/interface/dataType";

export class Loader {
    protected static readonly TargetNumWorkers = 25;

    protected _stream: ReadableStream;
    protected _options: CsvLoaderOptions;
    protected _update?: UpdateCallback;
    protected _types: TypeDeductionCallback;
    protected _resolve: ResolveCallback;
    protected _reject: RejectCallback;

    protected _reader: ReadableStreamDefaultReader<Uint8Array>;
    protected _chunks: ArrayBuffer[];
    protected _columns: Column[];

    public constructor(
        stream: ReadableStream,
        options: CsvLoaderOptions,
        updateCb: UpdateCallback,
        typesCb: TypeDeductionCallback
    ) {
        this._stream = stream;
        this._options = options;
        this._update = updateCb;
        this._types = typesCb;
    }

    public set resolve(resolve: ResolveCallback) {
        this._resolve = resolve;
    }

    public set reject(resolve: RejectCallback) {
        this._reject = resolve;
    }

    public load(): void {
        if (this._options.delimiter === undefined) {
            this._reject(
                'Delimiter not specified nor deductible from filename.');
        }

        this._resolve([buildColumn('none', DataType.Number)]);
    }

    protected read(): void {
        this._reader = this._stream.getReader();
        this._reader.read().then(this.readChunk.bind(this));
    }

    protected readChunk(
        result: ReadableStreamDefaultReadResult<Uint8Array>
    ): void {
        if (this._columns === undefined) {
            if (result.value !== undefined) {
                this.setupColumns(result.value.buffer);
                this._resolve(this._columns);
            } else {
                this._reject('No data');
            }
        }

        if (result.done) {
            return;
        }

        this._reader.read().then(this.readChunk.bind(this));
    }

    protected setupColumns(chunk: ArrayBuffer): void {
        const detectedTypes = [DataType.Number];
        const types = this._types(detectedTypes)
        this._columns = [
            ...types.columns.map((t) => buildColumn('none', t)),
            ...types.generatedColumns.map((t) => buildColumn('none', t.type))
        ];
    }
}
