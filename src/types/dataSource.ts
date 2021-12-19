export type InputData = Blob | File | ArrayBufferLike | Uint8Array | ReadableStream | string;

export type DataSource = InputData | Promise<InputData> | (() => Promise<InputData>);
