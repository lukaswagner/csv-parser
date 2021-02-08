import { Column } from "../../types/column/column"
import { DataType } from "../../types/dataType"
import { MainLoaderOptions } from "./options"

export enum MessageType {
    Setup,
    AddChunk,
    Finished,
}

export type StartData = {
    types: DataType[],
    options: MainLoaderOptions
}

export type AddChunkData = {
    types: ArrayBuffer
}

export type FinishedData = {
    columns: Array<Column>
}

export type MessageData = {
    type: MessageType,
    data: StartData | AddChunkData | FinishedData;
}
