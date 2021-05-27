import {
    TypeDeduction,
    TypeDeductionCallback,
    UpdateCallback
} from './types/callbacks';
import { Column } from './types/column/column';
import { CsvLoaderOptions } from './types/options';
import { Loader } from './loader';
import { MessageData } from './worker/main/interface';

// @ts-expect-error The path to the worker source is only during build.
const worker = new Worker(MAIN_WORKER_SOURCE);

export function test(text: string): void {
    console.log('lib:', text);
    worker.onmessage =
        (e: MessageEvent<MessageData>) => console.log('lib:', e.data);
    worker.postMessage('lib -> main');
}

export function loadFile(
    file: File,
    options: CsvLoaderOptions,
    update: UpdateCallback,
    types: TypeDeductionCallback = TypeDeduction.KeepAll
): Promise<Column[]> {
    const optionsClone = Object.apply({}, options);
    optionsClone.size ??= file.size;
    optionsClone.delimiter ??= deductDelimiter(file.name.split('.').pop());

    return loadStream(file.stream(), optionsClone, update, types);
}

export function loadUrl(
    url: string,
    options: CsvLoaderOptions,
    update: UpdateCallback,
    types: TypeDeductionCallback = TypeDeduction.KeepAll
): Promise<Column[]> {
    const cb = (response: Response): Promise<Column[]> => {
        const optionsClone = Object.assign({}, options);
        const size = 'Content-Length';
        if (response.headers.has(size)) {
            optionsClone.size ??= Number.parseInt(response.headers.get(size));
        }
        optionsClone.delimiter ??= deductDelimiter(url.split('.').pop());

        return loadStream(response.body, optionsClone, update, types);
    };
    return fetch(url).then(cb);
}

export function loadStream(
    stream: ReadableStream,
    options: CsvLoaderOptions,
    update: UpdateCallback,
    types: TypeDeductionCallback = TypeDeduction.KeepAll
): Promise<Column[]> {
    const loader = new Loader(stream, options, update, types);
    return new Promise<Column[]>((resolve, reject) => {
        loader.resolve = resolve;
        loader.reject = reject;
        loader.load();
    });
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
export * from './types/interface/dataType';
export * from './types/column/column';
export * from './types/chunk/chunk';
