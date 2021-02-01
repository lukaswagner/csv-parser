import { BaseChunk } from "../chunk/baseChunk";
import { DataType } from "../dataType";

export abstract class BaseColumn<T> {
    protected _name: string;
    protected _chunks: BaseChunk<T>[] = [];
    protected _type: DataType;
    protected _length = 0;
    protected _altered: boolean;

    protected constructor(name: string, type: DataType) {
        this._name = name;
        this._type = type;
    }

    public push(chunk: BaseChunk<T>): void {
        this._chunks.push(chunk);
        this._length += chunk.length;
        this._altered = true;
    }

    public reset(): void {
        this._chunks = [];
        this._length = 0;
        this._altered = true;
    }

    public get name(): string {
        return this._name;
    }

    public get type(): DataType {
        return this._type;
    }

    public get chunkCount(): number {
        return this._chunks.length;
    }

    public get length(): number {
        return this._length;
    }

    public get chunks(): BaseChunk<T>[] {
        return this._chunks;
    }

    public getChunks(start = 0, end?: number): BaseChunk<T>[] {
        return this._chunks.slice(start, end);
    }

    public getChunk(index: number): BaseChunk<T> {
        return this._chunks[index];
    }

    public get altered(): boolean {
        return this._altered;
    }

    public set altered(altered: boolean) {
        this._altered = altered;
    }
}
