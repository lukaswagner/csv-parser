import { DataType } from './dataType';

export interface IChunk<T> {
    readonly type: DataType;
    readonly length: number;
    readonly offset: number;
    get(index: number): T;
    set(index: number, value: T): void;
}

export interface INumberChunk extends IChunk<number> {
    readonly min: number;
    readonly max: number;
}
