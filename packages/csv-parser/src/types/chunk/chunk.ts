import { DataType } from '../dataType';
import { ColorChunk } from './colorChunk';
import { DateChunk } from './dateChunk';
import {
    AnyNumberChunk,
    Float32Chunk,
    Float64Chunk,
    Int16Chunk,
    Int32Chunk,
    Int8Chunk,
    NumberChunk,
    Uint16Chunk,
    Uint32Chunk,
    Uint8Chunk,
} from './numberChunk';
import { StringChunk } from './stringChunk';

export type Chunk = NumberChunk | ColorChunk | StringChunk | DateChunk;
export type AnyChunk = AnyNumberChunk & ColorChunk & StringChunk & DateChunk;

export function buildChunk(type: DataType, length: number, offset: number, shared: boolean): Chunk {
    switch (type) {
        case DataType.Number:
        case DataType.Float32:
            return new Float32Chunk(length, offset, shared);
        case DataType.Int8:
            return new Int8Chunk(length, offset, shared);
        case DataType.Uint8:
            return new Uint8Chunk(length, offset, shared);
        case DataType.Int16:
            return new Int16Chunk(length, offset, shared);
        case DataType.Uint16:
            return new Uint16Chunk(length, offset, shared);
        case DataType.Int32:
            return new Int32Chunk(length, offset, shared);
        case DataType.Uint32:
            return new Uint32Chunk(length, offset, shared);
        case DataType.Float64:
            return new Float64Chunk(length, offset, shared);
        case DataType.Color:
            return new ColorChunk(length, offset, shared);
        case DataType.Date:
            return new DateChunk(length, offset, shared);
        case DataType.String:
            return new StringChunk(length, offset, shared);
        default:
            return undefined;
    }
}

export function rebuildChunk(chunk: unknown, shared: boolean): Chunk {
    const oc = chunk as { _type: DataType };
    const nc = buildChunk(oc._type, 0, 0, shared);
    return Object.assign(nc, chunk);
}

export * from './colorChunk';
export * from './numberChunk';
export * from './dateChunk';
export * from './stringChunk';
