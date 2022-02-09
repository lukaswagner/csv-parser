export type SheetInput = { apiKey: string; sheetId: string; type: 'google' | 'excel' };

export type InputData =
    | Blob
    | File
    | ArrayBufferLike
    | Uint8Array
    | ReadableStream
    | string
    | SheetInput;

export type DataSource = InputData | Promise<InputData> | (() => Promise<InputData>);
