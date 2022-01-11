import {
    Float32Chunk,
    Float64Chunk,
    Int16Chunk,
    Int32Chunk,
    Int8Chunk,
    NumberChunk,
    Uint16Chunk,
    Uint32Chunk,
    Uint8Chunk,
} from '../chunk/numberChunk';
import { DataType } from '../dataType';
import { BaseColumn } from './baseColumn';

class BaseNumberColumn<C extends NumberChunk> extends BaseColumn<number, C> {
    protected _min: number;
    protected _max: number;

    public constructor(name: string) {
        super(name, DataType.Number);
        this._min = Number.POSITIVE_INFINITY;
        this._max = Number.NEGATIVE_INFINITY;
    }

    public push(chunk: C): void {
        super.push(chunk);
        if (chunk.min < this._min) this._min = chunk.min;
        if (chunk.max > this._max) this._max = chunk.max;
    }

    public reset(): void {
        super.reset();
        this._min = Number.POSITIVE_INFINITY;
        this._max = Number.NEGATIVE_INFINITY;
    }

    public get min(): number {
        return this._min;
    }

    public get max(): number {
        return this._max;
    }
}

export class Int8Column extends BaseNumberColumn<Int8Chunk> {}
export class Uint8Column extends BaseNumberColumn<Uint8Chunk> {}
export class Int16Column extends BaseNumberColumn<Int16Chunk> {}
export class Uint16Column extends BaseNumberColumn<Uint16Chunk> {}
export class Int32Column extends BaseNumberColumn<Int32Chunk> {}
export class Uint32Column extends BaseNumberColumn<Uint32Chunk> {}
export class Float32Column extends BaseNumberColumn<Float32Chunk> {}
export class Float64Column extends BaseNumberColumn<Float64Chunk> {}

export type NumberColumn =
    | Int8Column
    | Uint8Column
    | Int16Column
    | Uint16Column
    | Int32Column
    | Uint32Column
    | Float32Column
    | Float64Column;

export type AnyNumberColumn = Int8Column &
    Uint8Column &
    Int16Column &
    Uint16Column &
    Int32Column &
    Uint32Column &
    Float32Column &
    Float64Column;
