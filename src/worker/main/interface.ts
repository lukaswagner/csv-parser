import { ColumnGenerator, DataType } from '../../types/interface/dataType';
import { Chunk } from '../../types/chunk/chunk';
import { MainWorkerOptions } from './options';

export enum MessageType {
    Setup,
    AddChunk,
    NoMoreChunks,
    Processed,
    Finished,
}

export type SetupData = {
    columns: DataType[],
    generatedColumns: ColumnGenerator[],
    options: MainWorkerOptions
}

export type AddChunkData = {
    chunk: ArrayBufferLike
}

export type NoMoreChunksData = {
}

export type ProcessedData = {
    chunks: Array<Chunk>
}

export type FinishedData = {
}

type AnyData =
    SetupData |
    AddChunkData |
    NoMoreChunksData |
    ProcessedData |
    FinishedData;

export type MessageData = {
    type: MessageType,
    data: AnyData
}
