import { BaseChunk } from "./baseChunk";
import { DataType } from "./dataType";

export class NumberChunk extends BaseChunk<number> {
    protected _view: Float32Array;
    protected _min: number;
    protected _max: number;

    public get min(): number {
        return this._min;
    }

    public get max(): number {
        return this._max;
    }

    public constructor(length: number) {
        super(DataType.Number, length);
        this._data = new SharedArrayBuffer(length * 4);
        this._view = new Float32Array(this._data);
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
