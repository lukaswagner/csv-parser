import { Loader } from './loader';
import { Column } from './types/column/column';
import { ColumnTypes } from './types/dataType';
import { CsvLoaderOptions } from './types/options';

import type { ColumnHeader, Dispatcher } from './types/handlers';
import type { DataSource, InputData } from './types/dataSource';

export class CSV<D extends string> {
    protected _options: CsvLoaderOptions;
    protected _loader: Loader;

    #openedDataSource: D;

    public constructor(options: Partial<CsvLoaderOptions>) {
        this._options = {
            dataSources: {},
            includesHeader: true,
            typeInferLines: 20,
            verbose: false,
            ...options,
        };
        this._loader = new Loader();
    }

    protected openFile(file: Blob): Promise<ColumnHeader[]> {
        this._options.size ??= file.size;

        if (file instanceof File) {
            this._options.delimiter ??= deductDelimiter(file.name.split('.').pop());
        }

        this._loader.options = this._options;
        this._loader.stream = file.stream();

        return this._loader.open(this.#openedDataSource);
    }

    protected async openUrl(url: string): Promise<ColumnHeader[]> {
        this._options.delimiter ??= deductDelimiter(url.split('.').pop());
        const size = 'Content-Length';
        const response = await fetch(url);

        if (response.headers.has(size)) {
            this._options.size ??= Number.parseInt(response.headers.get(size));
        }

        this._loader.options = this._options;
        this._loader.stream = response.body;

        return this._loader.open(this.#openedDataSource);
    }

    protected openStream(stream: ReadableStream): Promise<ColumnHeader[]> {
        this._loader.options = this._options;
        this._loader.stream = stream;

        return this._loader.open(this.#openedDataSource);
    }

    protected openBuffer(buffer: ArrayBufferLike): Promise<ColumnHeader[]> {
        this._loader.options = this._options;
        this._loader.buffer = buffer;

        return this._loader.open(this.#openedDataSource);
    }

    #openInputData(source: InputData): Promise<ColumnHeader[]> {
        if (source instanceof Blob) {
            return this.openFile(source);
        } else if (typeof source === 'string') {
            return this.openUrl(source);
        } else if (source instanceof ReadableStream) {
            return this.openStream(source);
        } else if (
            source instanceof ArrayBuffer ||
            source instanceof SharedArrayBuffer ||
            source instanceof Uint8Array
        ) {
            return this.openBuffer(source);
        }
    }

    public async open(id: D): Promise<ColumnHeader[]> {
        const dataSource: DataSource = this._options.dataSources[id];
        const data = await (typeof dataSource === 'function' ? dataSource() : dataSource);

        this.#openedDataSource = id;

        return this.#openInputData(data);
    }

    public load(types: ColumnTypes): [Column[], Dispatcher] {
        this._loader.types = types;

        return this._loader.load();
    }

    public addDataSource(id: string, dataSource: DataSource): void {
        this._options.dataSources[id] = dataSource;
    }

    public removeDataSource(id: D): void {
        delete this._options.dataSources[id];
    }
}

function deductDelimiter(format: string): string {
    switch (format?.toLowerCase()) {
        case 'csv':
            return ',';
        case 'tsv':
            return '\t';
        default:
            return undefined;
    }
}

// re-export helpers
export * from './helper/createDataSources';

// re-export interface
export * from './types/chunk/chunk';
export * from './types/column/column';
export * from './types/dataType';
export * from './types/handlers';
export * from './types/options';
