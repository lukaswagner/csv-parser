import { BaseChunk as BC } from '../chunk/baseChunk';
import { DataType } from '../dataType';
import { IColumn } from '../interface/column';

export abstract class BaseColumn<T, C extends BC<T>> implements IColumn<T, C> {
    protected _name: string;
    protected _type: DataType;
    protected _chunks: C[] = [];
    protected _length = 0;
    protected _altered: boolean;

    protected constructor(name: string, type: DataType) {
        this._name = name;
        this._type = type;
    }

    public push(chunk: C): void {
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

    public get length(): number {
        return this._length;
    }

    public get(index: number): T {
        const chunk = this._chunks.find(c => c.offset < index && c.offset + c.length >= index);
        if (!chunk) throw new Error('Invalid index.');
        return chunk.get(index - chunk.offset);
    }
    public set(index: number, value: T): void {
        const chunk = this._chunks.find(c => c.offset < index && c.offset + c.length >= index);
        if (!chunk) throw new Error('Invalid index.');
        chunk.set(index - chunk.offset, value);
    }

    public get chunkCount(): number {
        return this._chunks.length;
    }

    public get chunks(): C[] {
        return this._chunks;
    }

    public getChunk(index: number): C {
        return this._chunks[index];
    }

    public getChunks(start = 0, end?: number): C[] {
        return this._chunks.slice(start, end);
    }

    public get altered(): boolean {
        return this._altered;
    }

    public set altered(altered: boolean) {
        this._altered = altered;
    }
}
