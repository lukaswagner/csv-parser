import { buffer } from '../../helper/buffer';
import { DataType } from '../dataType';
import { vec4 } from '../tuples';
import { BufferChunk } from './bufferChunk';

export class ColorChunk extends BufferChunk<vec4> {
    protected _view: Float32Array;

    public get view(): Float32Array {
        return this._view;
    }

    public constructor(length: number, offset: number, shared: boolean) {
        super(DataType.Color, length, offset);
        this._data = buffer(length * 4 * 4, shared);
        this._view = new Float32Array(this._data);
    }

    public get(index: number): vec4 {
        return Array.from(this._view.subarray(index * 4, (index + 1) * 4)) as vec4;
    }

    public set(index: number, value: vec4): void {
        this._view.set(value, index * 4);
    }
}
