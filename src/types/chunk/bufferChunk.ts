import { DataType } from "../interface/dataType";
import { BaseChunk } from "./baseChunk";

export abstract class BufferChunk<T> extends BaseChunk<T> {
    protected _data: SharedArrayBuffer;

    public get data(): SharedArrayBuffer {
        return this._data;
    }
}
