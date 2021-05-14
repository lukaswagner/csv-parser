import { BaseChunk } from './baseChunk';
import { DataType } from '../interface/dataType';

export class StringChunk extends BaseChunk<string> {
    protected _data: Array<string>;

    public constructor(length: number, offset: number) {
        super(DataType.String, length, offset);
        this._data = new Array<string>(length);
    }

    public get(index: number): string {
        return this._data[index];
    }

    public set(index: number, value: string): void {
        this._data[index] = value;
    }
}
