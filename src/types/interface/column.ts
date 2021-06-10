import { IChunk } from './chunk';
import { DataType } from './dataType';

export interface IColumn<T, C extends IChunk<T>> {
    readonly type: DataType;
    readonly length: number;
    get(index: number): T;
    set(index: number, value: T): void;
    readonly chunkCount: number;
    readonly chunks: C[];
    getChunk(index: number): C;
    getChunks(start?: number, end?: number): C[];
}

export interface INumberColumn extends IColumn<number, IChunk<number>> {
    readonly min: number;
    readonly max: number;
}
