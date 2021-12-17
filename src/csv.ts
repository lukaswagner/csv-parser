import { Loader } from './loader';
import { Column } from './types/column/column';
import { ColumnTypes, DataType } from './types/dataType';
import {
    ColumnsHandler,
    DataHandler,
    DoneHandler,
    ErrorHandler,
    EventHandler,
    LoadStatistics,
} from './types/handlers';
import { CsvLoaderOptions } from './types/options';

enum Event {
    Columns = 'columns',
    Data = 'data',
    Done = 'done',
    Error = 'error',
}
type EventType = `${Event}`;

type ColumnHeader = { name: string; type: DataType };

type InputData = Blob | File | ArrayBufferLike | Uint8Array | ReadableStream | string;

export type DataSource = InputData | Promise<InputData> | (() => Promise<InputData>);

export class CSV<D extends string> {
    protected _options: CsvLoaderOptions;
    protected _loader: Loader;
    protected _handlers: Map<EventType, Map<D, Set<EventHandler>>>;

    #openedDataSource: string;

    public constructor(options: Partial<CsvLoaderOptions>) {
        this._options = {
            dataSources: {},
            includesHeader: true,
            typeInferLines: 20,
            verbose: false,
            ...options,
        };
        this._loader = new Loader();
        this._loader.onColumns = this.dispatch.bind(this, Event.Columns);
        this._loader.onData = this.dispatch.bind(this, Event.Data);
        this._loader.onDone = this.dispatch.bind(this, Event.Done);
        this._loader.onError = this.dispatch.bind(this, Event.Error);
        this._handlers = new Map<EventType, Map<D, Set<EventHandler>>>([
            [Event.Columns, new Map()],
            [Event.Data, new Map()],
            [Event.Done, new Map()],
            [Event.Error, new Map()],
        ]);

        for (const id of Object.keys(this._options.dataSources)) {
            this._handlers.forEach((handlerMap) => {
                handlerMap.set(id as D, new Set());
            });
        }
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

    protected dispatch(event: Event, id: D, data: unknown): void {
        const h = this._handlers.get(event).get(id);

        switch (event) {
            case Event.Columns:
                h.forEach((h) => (h as ColumnsHandler)(id, data as Column[]));
                break;
            case Event.Data:
                h.forEach((h) => (h as DataHandler)(id, data as number));
                break;
            case Event.Done:
                h.forEach((h) => (h as DoneHandler)(id, data as LoadStatistics));
                break;
            case Event.Error:
                h.forEach((h) => (h as ErrorHandler)(id, data as string));
                break;
            default:
                break;
        }
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

    public load(types: ColumnTypes): void {
        this._loader.types = types;
        this._loader.load();
    }

    public on(event: EventType, id: D, handler: EventHandler): void {
        this._handlers.get(event).get(id).add(handler);
    }

    public off(event: EventType, id: D, handler: EventHandler): void {
        this._handlers.get(event).get(id).delete(handler);
    }

    public addDataSource(id: D, dataSource: DataSource): void {
        this._options.dataSources[id] = dataSource;
        this._handlers.forEach((handlerMap) => {
            handlerMap.set(id, new Set());
        });
    }

    public removeDataSource(id: D): void {
        delete this._options.dataSources[id];
        this._handlers.forEach((handlerMap) => {
            handlerMap.delete(id);
        });
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

// re-export interface
export * from './types/chunk/chunk';
export * from './types/column/column';
export * from './types/dataType';
export * from './types/handlers';
export * from './types/options';
