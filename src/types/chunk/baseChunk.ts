import { DataType } from "../dataType";

export abstract class BaseChunk<T> {
    protected _data: SharedArrayBuffer;
    protected _type: DataType;
    protected _length: number;

    protected constructor(type: DataType, length: number) {
        this._type = type;
        this._length = length;
    }

    public get type(): DataType {
        return this._type;
    }

    public get length(): number {
        return this._length;
    }

    public get data(): SharedArrayBuffer {
        return this._data;
    }

    public abstract get(index: number): T;
    public abstract set(index: number, value: T): void;
}
