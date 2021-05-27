import { ColumnGenerator, DataType } from '../../types/interface/dataType';
import { Chunk } from '../../types/chunk/chunk';
import { MainLoaderOptions } from './options';

export enum MessageType {
    Setup,
    AddChunk,
    Processed,
    Finished,
}

export type SetupData = {
    columns: DataType[],
    generatedColumns: ColumnGenerator[],
    options: MainLoaderOptions
}

export type AddChunkData = {
    chunk: ArrayBufferLike
}

export type ProcessedData = {
    chunks: Array<Chunk>
}

export type FinishedData = {
}

export type MessageData = {
    type: MessageType,
    data: SetupData | AddChunkData | ProcessedData | FinishedData;
}
