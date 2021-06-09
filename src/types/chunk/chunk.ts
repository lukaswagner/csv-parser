
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
    Uint8Chunk
} from './numberChunk';
import { ColorChunk } from './colorChunk';
import { DataType } from '../interface/dataType';
import { StringChunk } from './stringChunk';

export type Chunk = NumberChunk | ColorChunk | StringChunk;
export type AnyChunk = AnyNumberChunk & ColorChunk & StringChunk;

export function buildChunk(
    type: DataType, length: number, offset: number = 0
): Chunk {
    switch (type) {
        case DataType.Number:
        case DataType.Float32:
            return new Float32Chunk(length, offset);
        case DataType.Int8:
            return new Int8Chunk(length, offset);
        case DataType.Uint8:
            return new Uint8Chunk(length, offset);
        case DataType.Int16:
            return new Int16Chunk(length, offset);
        case DataType.Uint16:
            return new Uint16Chunk(length, offset);
        case DataType.Int32:
            return new Int32Chunk(length, offset);
        case DataType.Uint32:
            return new Uint32Chunk(length, offset);
        case DataType.Float64:
            return new Float64Chunk(length, offset);
        case DataType.Color:
            return new ColorChunk(length, offset);
        case DataType.String:
            return new StringChunk(length, offset);
        default:
            return undefined;
    }
}

export function rebuildChunk(chunk: unknown): Chunk {
    const oc = chunk as { _type: DataType };
    const nc = buildChunk(oc._type, 0, 0);
    return Object.assign(nc, chunk);
}
