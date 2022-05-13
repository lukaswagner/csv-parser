import { BaseChunk } from './baseChunk';

export abstract class BufferChunk<T> extends BaseChunk<T> {
    protected _data: ArrayBufferLike;

    public get data(): ArrayBufferLike {
        return this._data;
    }
}
