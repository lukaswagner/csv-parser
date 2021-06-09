import { ColumnGenerator, DataType } from '../../types/interface/dataType';
import { Chunk } from '../../types/chunk/chunk';
import { SubWorkerOptions } from './options';

export enum MessageType {
    Start,
    Finished,
}

export type StartData = {
    chunks: ArrayBufferLike[],
    columns: DataType[],
    generatedColumns: ColumnGenerator[],
    options: SubWorkerOptions
}

export type FinishedData = {
    chunks: Array<Chunk>,
    generatedChunks: Array<Chunk>,
    startRemainder: SharedArrayBuffer,
    endRemainder: SharedArrayBuffer
}

export type MessageData = {
    type: MessageType,
    data: StartData | FinishedData;
}
