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

import { CsvLoaderOptions } from './types/options';
import { parse } from './helper/parse';
import { splitLine } from './helper/splitLine';

export class Loader {
    protected static readonly TargetNumWorkers = 25;

    protected _stream: ReadableStream;
    protected _options: CsvLoaderOptions;
    protected _update?: UpdateCallback;
    protected _types: TypeDeductionCallback;
    protected _resolve: ResolveCallback;
    protected _reject: RejectCallback;

    protected _reader: ReadableStreamDefaultReader<Uint8Array>;
    protected _readChunks: Uint8Array[];
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
            this._reject('No data');
            return;
        }

        const v = result.value;
        if (this._columns === undefined) {
            this.setupColumns(v.buffer);
            this._resolve(this._columns);
        }

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

        const types = this._types(detectedTypes);
        this._columns = [
            ...types.columns.map((t, i) => buildColumn(
                this._options.includesHeader ? split[0][i] : `Column ${i}`, t)),
            ...types.generatedColumns.map((t) => buildColumn(t.name, t.type))
        ];
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

        this.read();
        // this._resolve([buildColumn('none', DataType.Number)]);
    }
}
