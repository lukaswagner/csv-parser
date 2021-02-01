import { BaseChunk } from "./baseChunk";
import { DataType } from "./dataType";
import { vec4 } from "./tuples";

export class ColorChunk extends BaseChunk<vec4> {
    protected _view: Float32Array;

    public constructor(length: number) {
        super(DataType.Color, length);
        this._data = new SharedArrayBuffer(length * 4 * 4);
        this._view = new Float32Array(this._data);
    }

    public get(index: number): vec4 {
        return Array.from(
            this._view.subarray(index * 4, (index + 1) * 4)
        ) as vec4;
    }

    public set(index: number, value: vec4): void {
        this._view.set(value, index * 4);
    }
}
