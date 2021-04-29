import { Chunk } from "../interface/chunk";
import { DataType } from "../interface/dataType";

export abstract class BaseChunk<T> implements Chunk<T> {
    protected _type: DataType;
    protected _length: number;
    protected _offset: number;

    protected constructor(type: DataType, length: number, offset: number) {
        this._type = type;
        this._length = length;
        this._offset = offset;
    }

    public get type(): DataType {
        return this._type;
    }

    public get length(): number {
        return this._length;
    }

    public get offset(): number {
        return this._offset;
    }

    public abstract get(index: number): T;
    public abstract set(index: number, value: T): void;
}
