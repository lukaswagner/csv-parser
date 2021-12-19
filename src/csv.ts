import { fetchSheetDataRange, fetchSheetValues } from './helper/spreadsheets';
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
    OpenedHandler,
} from './types/handlers';
import { CsvLoaderOptions } from './types/options';

enum Event {
    Opened = 'opened',
    Columns = 'columns',
    Data = 'data',
    Done = 'done',
    Error = 'error',
}
type EventType = `${Event}`;

type ColumnHeader = { name: string; type: DataType };

type SheetInput = { apiKey: string; sheetId: string };

type InputData = Blob | File | ArrayBufferLike | Uint8Array | ReadableStream | string | SheetInput;

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
        this._loader.onOpened = this.dispatch.bind(this, Event.Opened);
        this._loader.onColumns = this.dispatch.bind(this, Event.Columns);
        this._loader.onData = this.dispatch.bind(this, Event.Data);
        this._loader.onDone = this.dispatch.bind(this, Event.Done);
        this._loader.onError = this.dispatch.bind(this, Event.Error);
        this._handlers = new Map<EventType, Map<D, Set<EventHandler>>>([
            [Event.Opened, new Map()],
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

    protected openFile(file: Blob): void {
        this._options.size ??= file.size;

        if (file instanceof File) {
            this._options.delimiter ??= deductDelimiter(file.name.split('.').pop());
        }

        this._loader.options = this._options;
        this._loader.stream = file.stream();
        this._loader.open(this.#openedDataSource);
    }

    protected openUrl(url: string): void {
        this._options.delimiter ??= deductDelimiter(url.split('.').pop());
        const size = 'Content-Length';
        fetch(url).then((res) => {
            if (res.headers.has(size)) {
                this._options.size ??= Number.parseInt(res.headers.get(size));
            }
            this._loader.options = this._options;
            this._loader.stream = res.body;
            this._loader.open(this.#openedDataSource);
        });
    }

    protected openStream(stream: ReadableStream): void {
        this._loader.options = this._options;
        this._loader.stream = stream;
        this._loader.open(this.#openedDataSource);
    }

    protected openBuffer(buffer: ArrayBufferLike): void {
        this._loader.options = this._options;
        this._loader.buffer = buffer;
        this._loader.open(this.#openedDataSource);
    }

    protected dispatch(event: Event, id: D, data: unknown): void {
        const h = this._handlers.get(event).get(id);

        switch (event) {
            case Event.Opened:
                h.forEach((h) => (h as OpenedHandler)(id, data as ColumnHeader[]));
                break;
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

    async #openSheet(data: SheetInput): Promise<void> {
        const { apiKey, sheetId } = data;

        // Determine range specifier for sheet area that is filled with data
        const range = await fetchSheetDataRange(sheetId, apiKey);

        // Fetch sheet values as stream
        const stream = await fetchSheetValues(sheetId, apiKey, range);

        this._options.delimiter ??= deductDelimiter('csv');

        // TODO: Determine data length ?

        this._loader.options = this._options;
        this._loader.stream = stream;
        this._loader.open(this.#openedDataSource);
    }

    #openInputData(source: InputData): void {
        if (source instanceof Blob) {
            this.openFile(source);
        } else if (typeof source === 'string') {
            this.openUrl(source);
        } else if (source instanceof ReadableStream) {
            this.openStream(source);
        } else if (
            source instanceof ArrayBuffer ||
            source instanceof SharedArrayBuffer ||
            source instanceof Uint8Array
        ) {
            this.openBuffer(source);
        } else if ('sheetId' in source && 'apiKey' in source) {
            this.#openSheet(source);
        }
    }

    public async open(id: D): Promise<void> {
        const dataSource: DataSource = this._options.dataSources[id];
        const data = await (typeof dataSource === 'function' ? dataSource() : dataSource);

        this.#openedDataSource = id;
        this.#openInputData(data);
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
