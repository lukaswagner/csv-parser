import { ColumnGenerator, DataType } from '../../types/dataType';
import { Chunk } from '../../types/chunk/chunk';
import { LoadStatistics } from '../../types/handlers';
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

export type FinishedData = LoadStatistics;

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
