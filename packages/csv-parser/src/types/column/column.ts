import { Chunk, rebuildChunk } from '../chunk/chunk';
import { DataType } from '../dataType';
import { ColorColumn } from './colorColumn';
import { DateColumn } from './dateColumn';
import {
    AnyNumberColumn,
    Float32Column,
    Float64Column,
    Int16Column,
    Int32Column,
    Int8Column,
    NumberColumn,
    Uint16Column,
    Uint32Column,
    Uint8Column,
} from './numberColumn';
import { StringColumn } from './stringColumn';

export type Column = NumberColumn | ColorColumn | StringColumn | DateColumn;
export type AnyColumn = AnyNumberColumn & ColorColumn & StringColumn & DateColumn;

export function buildColumn(name: string, type: DataType): Column {
    switch (type) {
        case DataType.Number:
        case DataType.Float32:
            return new Float32Column(name);
        case DataType.Int8:
            return new Int8Column(name);
        case DataType.Uint8:
            return new Uint8Column(name);
        case DataType.Int16:
            return new Int16Column(name);
        case DataType.Uint16:
            return new Uint16Column(name);
        case DataType.Int32:
            return new Int32Column(name);
        case DataType.Uint32:
            return new Uint32Column(name);
        case DataType.Float64:
            return new Float64Column(name);
        case DataType.Color:
            return new ColorColumn(name);
        case DataType.Date:
            return new DateColumn(name);
        case DataType.String:
            return new StringColumn(name);
        default:
            return undefined;
    }
}

export function rebuildColumn(column: unknown): Column {
    const oldColumn = column as {
        _type: DataType;
        _name: string;
    };
    const newColumn = buildColumn(oldColumn._name, oldColumn._type);
    Object.assign(newColumn, column);
    newColumn.chunks.forEach((chunk, index, chunks) => {
        chunks[index] = rebuildChunk(chunk);
    });
    return newColumn;
}

export * from './colorColumn';
export * from './numberColumn';
export * from './dateColumn';
export * from './stringColumn';
