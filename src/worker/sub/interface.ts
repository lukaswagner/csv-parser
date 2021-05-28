import { ColumnGenerator, DataType } from '../../types/interface/dataType';
import { Chunk } from '../../types/chunk/chunk';
import { SubWorkerOptions } from './options';

export enum MessageType {
    Start,
    Finished,
}

export type StartData = {
    chunks: ArrayBuffer[],
    columns: DataType[],
    generatedColumns: ColumnGenerator[],
    options: SubWorkerOptions
}

export type FinishedData = {
    columns: Array<Chunk>,
    startRemainder: ArrayBuffer,
    endRemainder: ArrayBuffer
}

export type MessageData = {
    type: MessageType,
    data: StartData | FinishedData;
}
