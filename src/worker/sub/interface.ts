import { Chunk } from "../../types/chunk/chunk"
import { DataType } from "../../types/dataType"
import { SubWorkerOptions } from "./options"

export enum MessageType {
    Setup,
    Finished,
}

export type StartData = {
    chunks: ArrayBuffer[],
    types: DataType[],
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
