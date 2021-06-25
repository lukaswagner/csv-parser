import {
    TypeDeduction,
    TypeDeductionCallback,
    UpdateCallback
} from './types/callbacks';
import { Column } from './types/column/column';
import { CsvLoaderOptions } from './types/options';
import { Loader } from './loader';

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

export function loadBuffer(
    buffer: ArrayBufferLike,
    options: CsvLoaderOptions,
    update: UpdateCallback,
    types: TypeDeductionCallback = TypeDeduction.KeepAll
): Promise<Column[]> {
    const loader = new Loader(buffer, options, update, types);
    return new Promise<Column[]>((resolve, reject) => {
        loader.resolve = resolve;
        loader.reject = reject;
        loader.load();
    });
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
export * from './types/dataType';
export * from './types/column/column';
export * from './types/chunk/chunk';
