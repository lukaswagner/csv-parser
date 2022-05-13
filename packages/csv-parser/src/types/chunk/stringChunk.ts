import { DataType } from '../dataType';
import { BaseChunk } from './baseChunk';

export class StringChunk extends BaseChunk<string> {
    protected _data: Array<string>;

    // shared option included for consistency
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public constructor(length: number, offset: number, shared: boolean) {
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
