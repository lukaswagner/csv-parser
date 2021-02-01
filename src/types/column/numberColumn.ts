import { BaseChunk } from "../chunk/baseChunk";
import { NumberChunk } from "../chunk/numberChunk";
import { DataType } from "../dataType";
import { BaseColumn } from "./baseColumn";

export class NumberColumn extends BaseColumn<number> {
    protected _min: number;
    protected _max: number;

    public constructor(name: string) {
        super(name, DataType.Number);
        this._min = Number.POSITIVE_INFINITY;
        this._max = Number.NEGATIVE_INFINITY;
    }

    public push(chunk: BaseChunk<number>): void {
        super.push(chunk);
        const nc = chunk as NumberChunk;
        if (nc.min < this._min) this._min = nc.min;
        if (nc.max > this._max) this._max = nc.max;
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
