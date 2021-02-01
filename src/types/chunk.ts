import { ColorChunk } from "./colorChunk";
import { DataType } from "./dataType";
import { NumberChunk } from "./numberChunk";
import { StringChunk } from "./stringChunk";

export type Chunk = NumberChunk | ColorChunk | StringChunk;
export type AnyChunk = NumberChunk & ColorChunk & StringChunk;

export function buildChunk(type: DataType, length: number): Chunk {
    switch (type) {
        case DataType.Number:
            return new NumberChunk(length);
        case DataType.Color:
            return new ColorChunk(length);
        case DataType.String:
            return new StringChunk(length);
        default:
            return undefined;
    }
}

export function rebuildChunk(chunk: unknown): Chunk {
    const oc = chunk as { _type: DataType };
    const nc = buildChunk(oc._type, 0);
    return Object.assign(nc, chunk);
}
