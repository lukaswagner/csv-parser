import { BufferChunk } from './bufferChunk';
import { DataType } from '../dataType';

interface NumArray {
    readonly length: number;
    [n: number]: number;
}

abstract class BaseNumberChunk<A extends NumArray> extends BufferChunk<number> {
    protected _view: A;
    protected _min: number;
    protected _max: number;

    public get min(): number {
        return this._min;
    }

    public get max(): number {
        return this._max;
    }

    protected constructor(length: number, offset: number, bytes: number) {
        super(DataType.Number, length, offset);
        this._data = new SharedArrayBuffer(length * bytes);
        this._min = Number.POSITIVE_INFINITY;
        this._max = Number.NEGATIVE_INFINITY;
    }

    public get(index: number): number {
        return this._view[index];
    }

    public set(index: number, value: number): void {
        this._view[index] = value;
        if (value < this._min) this._min = value;
        if (value > this._max) this._max = value;
    }
}

export class Int8Chunk extends BaseNumberChunk<Int8Array> {
    public constructor(length: number, offset: number) {
        super(length, offset, 1);
        this._view = new Int8Array(this._data);
    }
}

export class Uint8Chunk extends BaseNumberChunk<Uint8Array> {
    public constructor(length: number, offset: number) {
        super(length, offset, 1);
        this._view = new Uint8Array(this._data);
    }
}

export class Int16Chunk extends BaseNumberChunk<Int16Array> {
    public constructor(length: number, offset: number) {
        super(length, offset, 2);
        this._view = new Int16Array(this._data);
    }
}

export class Uint16Chunk extends BaseNumberChunk<Uint16Array> {
    public constructor(length: number, offset: number) {
        super(length, offset, 2);
        this._view = new Uint16Array(this._data);
    }
}

export class Int32Chunk extends BaseNumberChunk<Int32Array> {
    public constructor(length: number, offset: number) {
        super(length, offset, 4);
        this._view = new Int32Array(this._data);
    }
}

export class Uint32Chunk extends BaseNumberChunk<Uint32Array> {
    public constructor(length: number, offset: number) {
        super(length, offset, 4);
        this._view = new Uint32Array(this._data);
    }
}

export class Float32Chunk extends BaseNumberChunk<Float32Array> {
    public constructor(length: number, offset: number) {
        super(length, offset, 4);
        this._view = new Float32Array(this._data);
    }
}

export class Float64Chunk extends BaseNumberChunk<Float64Array> {
    public constructor(length: number, offset: number) {
        super(length, offset, 8);
        this._view = new Float64Array(this._data);
    }
}

export type NumberChunk =
    Int8Chunk | Uint8Chunk | Int16Chunk | Uint16Chunk |
    Int32Chunk | Uint32Chunk | Float32Chunk | Float64Chunk;

export type AnyNumberChunk =
    Int8Chunk & Uint8Chunk & Int16Chunk & Uint16Chunk &
    Int32Chunk & Uint32Chunk & Float32Chunk & Float64Chunk;
