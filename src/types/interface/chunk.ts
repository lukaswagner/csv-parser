import { DataType } from './dataType';

export interface Chunk<T> {
    readonly type: DataType;
    readonly length: number;
    readonly offset: number;
    get(index: number): T;
    set(index: number, value: T): void;
}

export interface NumberChunk extends Chunk<number> {
    readonly min: number;
    readonly max: number;
}
