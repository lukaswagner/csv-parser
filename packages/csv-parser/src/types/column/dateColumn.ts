import { DateChunk } from '../chunk/dateChunk';
import { DataType } from '../dataType';
import { BaseColumn } from './baseColumn';

export class DateColumn extends BaseColumn<Date, DateChunk> {
    protected _min: number;
    protected _max: number;

    public constructor(name: string) {
        super(name, DataType.Number);
        this._min = Number.POSITIVE_INFINITY;
        this._max = Number.NEGATIVE_INFINITY;
    }

    public push(chunk: DateChunk): void {
        super.push(chunk);
        if (chunk.rawMin < this._min) this._min = chunk.rawMin;
        if (chunk.rawMax > this._max) this._max = chunk.rawMax;
    }

    public reset(): void {
        super.reset();
        this._min = Number.POSITIVE_INFINITY;
        this._max = Number.NEGATIVE_INFINITY;
    }

    public get rawMin(): number {
        return this._min;
    }

    public get rawMax(): number {
        return this._max;
    }

    public get min(): Date {
        return new Date(this._min);
    }

    public get max(): Date {
        return new Date(this._max);
    }
}
