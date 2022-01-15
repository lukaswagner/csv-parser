import { Chunk } from '../../types/chunk/chunk';
import { ColumnGenerator, DataType } from '../../types/dataType';
import { SubWorkerOptions } from './options';

export enum MessageType {
    Start,
    Finished,
}

export type StartData = {
    chunks: ArrayBufferLike[];
    columns: DataType[];
    generatedColumns: ColumnGenerator[];
    options: SubWorkerOptions;
    lastChunk: boolean;
};

export type FinishedData = {
    chunks: Array<Chunk>;
    generatedChunks: Array<Chunk>;
    startRemainder: SharedArrayBuffer;
    endRemainder: SharedArrayBuffer;
};

export type MessageData = {
    type: MessageType;
    data: StartData | FinishedData;
};
