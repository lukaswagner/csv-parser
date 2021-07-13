import { Column } from './types/column/column';
import { CsvLoaderOptions } from './types/options';
import { ColumnTypes, DataType } from './types/dataType';
import { Loader } from './loader';
import { ColumnsHandler, DataHandler, DoneHandler, ErrorHandler, EventHandler, OpenedHandler } from './types/callbacks';

enum Event {
    Opened = 'opened',
    Columns = 'columns',
    Data = 'data',
    Done = 'done',
    Error = 'error'
}

type ColumnHeader = { name: string, type: DataType };

export class CSV {
    protected _options: CsvLoaderOptions;
    protected _loader: Loader;
    protected _handlers: Map<Event, Set<EventHandler>>;

    public constructor(options: CsvLoaderOptions) {
        this._options = Object.apply({}, options);
        this._loader = new Loader();
        this._loader.onOpened = this.dispatch.bind(this, Event.Opened);
        this._loader.onColumns = this.dispatch.bind(this, Event.Columns);
        this._loader.onData = this.dispatch.bind(this, Event.Data);
        this._loader.onDone = this.dispatch.bind(this, Event.Done);
        this._loader.onError = this.dispatch.bind(this, Event.Error);
    }

    protected openFile(file: File): void {
        this._options.size ??= file.size;
        this._options.delimiter ??= deductDelimiter(file.name.split('.').pop());
        this._loader.options = this._options;
        this._loader.stream = file.stream();
        this._loader.open();
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
            this._loader.open();
        });
    }

    protected openStream(stream: ReadableStream): void {
        this._loader.options = this._options;
        this._loader.stream = stream;
        this._loader.open();
    }

    protected openBuffer(buffer: ArrayBufferLike): void {
        this._loader.options = this._options;
        this._loader.buffer = buffer;
        this._loader.open();
    }

    protected dispatch(event: Event, data: unknown): void {
        const h = this._handlers.get(event);
        switch (event) {
            case Event.Opened:
                h.forEach((h) => (h as OpenedHandler)(data as ColumnHeader[]));
                break;
            case Event.Columns:
                h.forEach((h) => (h as ColumnsHandler)(data as Column[]));
                break;
            case Event.Data:
                h.forEach((h) => (h as DataHandler)());
                break;
            case Event.Done:
                h.forEach((h) => (h as DoneHandler)());
                break;
            case Event.Error:
                h.forEach((h) => (h as ErrorHandler)(data as string));
                break;
            default:
                break;
        }
    }

    public open(source: unknown): void {
        if(source instanceof File) {
            this.openFile(source);
        } else if(typeof source === 'string') {
            this.openUrl(source);
        } else if(source instanceof ReadableStream) {
            this.openStream(source);
        } else if(
            source instanceof ArrayBuffer ||
            source instanceof SharedArrayBuffer ||
            source instanceof Uint8Array
        ) {
            this.openBuffer(source);
        }
    }

    public load(types: ColumnTypes): void {
        this._loader.types = types;
        this._loader.load();
    }

    public on(event: Event, handler: EventHandler): void {
        this._handlers.get(event).add(handler);
    }

    public off(event: Event, handler: EventHandler): void {
        this._handlers.get(event).delete(handler);
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
export * from './types/options';
export * from './types/callbacks';
export * from './types/dataType';
export * from './types/column/column';
export * from './types/chunk/chunk';
