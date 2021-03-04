import {
    RejectCallback,
    ResolveCallback,
    UpdateCallback
} from "./types/callbacks";

import {
    buildColumn,
    Column
} from "./types/column/column";

import { CsvLoaderOptions } from "./types/options";
import { DataType } from "./types/dataType";

export class Loader {
    protected _stream: ReadableStream;
    protected _options: CsvLoaderOptions;
    protected _update?: UpdateCallback;
    protected _resolve: ResolveCallback;
    protected _reject: RejectCallback;

    public constructor(
        stream: ReadableStream,
        options: CsvLoaderOptions,
        updateCb?: UpdateCallback
    ) {
        this._stream = stream;
        this._options = options;
        this._update = updateCb;
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
}
