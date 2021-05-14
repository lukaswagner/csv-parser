import { Chunk } from './chunk';
import { DataType } from './dataType';

export interface Column<T, C extends Chunk<T>> {
    readonly type: DataType;
    readonly length: number;
    get(index: number): T;
    set(index: number, value: T): void;
    readonly chunkCount: number;
    readonly chunks: C[];
    getChunk(index: number): C;
    getChunks(start?: number, end?: number): C[];
}

export interface NumberColumn extends Column<number, Chunk<number>> {
    readonly min: number;
    readonly max: number;
}
