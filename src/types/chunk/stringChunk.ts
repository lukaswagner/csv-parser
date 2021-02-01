import { BaseChunk } from "./baseChunk";
import { DataType } from "../dataType";

export class StringChunk extends BaseChunk<string> {
    public constructor(length: number) {
        super(DataType.String, length);
        this._data = new SharedArrayBuffer(0);
    }

    public get(index: number): string {
        return 'Not implemented';
    }

    public set(index: number, value: string): void {
    }
}
