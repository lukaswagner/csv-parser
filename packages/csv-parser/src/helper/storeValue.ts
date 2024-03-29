import { Chunk, DateChunk, StringChunk } from '../types/chunk/chunk';
import { ColorChunk } from '../types/chunk/colorChunk';
import { NumberChunk } from '../types/chunk/numberChunk';
import { DataType } from '../types/dataType';
import { vec4 } from '../types/tuples';

export function storeValue(value: unknown, index: number, chunk: Chunk): void {
    switch (chunk.type) {
        case DataType.Number:
            (chunk as NumberChunk).set(index, value as number);
            break;
        case DataType.Color:
            (chunk as ColorChunk).set(index, value as vec4);
            break;
        case DataType.Date:
            (chunk as DateChunk).set(index, value as Date);
            break;
        case DataType.String:
            (chunk as StringChunk).set(index, value as string);
            break;
        default:
            break;
    }
}
