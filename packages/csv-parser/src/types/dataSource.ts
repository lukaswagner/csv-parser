export type SheetType = 'google' | 'excel';

export type SheetInput = { apiKey: string; sheetUrl: string };

export type InputData =
    | Blob
    | File
    | ArrayBufferLike
    | Uint8Array
    | ReadableStream
    | string
    | SheetInput;

export type DataSource = InputData | Promise<InputData> | (() => Promise<InputData>);
