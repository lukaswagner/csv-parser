import { DataType } from '../dataType';
import { IChunk } from '../interface/chunk';

export abstract class BaseChunk<T> implements IChunk<T> {
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

    public set offset(offset: number) {
        this._offset = offset;
    }

    public abstract get(index: number): T;
    public abstract set(index: number, value: T): void;
}
