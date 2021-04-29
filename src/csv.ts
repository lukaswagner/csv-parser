import { Column } from "./types/column/column";
import { CsvLoaderOptions } from "./types/options";
import { TypeDeduction, TypeDeductionCallback, UpdateCallback } from "./types/callbacks";
import { Loader } from "./loader";

// @ts-ignore
const worker = new Worker(MAIN_WORKER_SOURCE);

export function test(text: string): void {
    console.log('lib:', text);
    worker.onmessage = (e: MessageEvent<any>) => console.log('lib:', e.data);
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
};

export function loadUrl(
    url: string,
    options: CsvLoaderOptions,
    update: UpdateCallback,
    types: TypeDeductionCallback = TypeDeduction.KeepAll
): Promise<Column[]> {
    const cb = (response: Response): Promise<Column[]> => {
        const optionsClone = Object.apply({}, options);
        const size = 'Content-Length';
        if (response.headers.has(size)) {
            optionsClone.size ??= response.headers.get(size);
        }
        optionsClone.delimiter ??= deductDelimiter(url.split('.').pop());

        return loadStream(response.body, optionsClone, update, types);
    }
    return fetch(url).then(cb);
};

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
};

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

export default {
    test,
    loadFile,
    loadUrl,
    loadStream
}
