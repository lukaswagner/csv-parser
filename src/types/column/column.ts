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
    Uint8Column
} from './numberColumn';
import { Chunk } from '../chunk/chunk';
import { ColorColumn } from './colorColumn';
import { DataType } from '../dataType';
import { StringColumn } from './stringColumn';

export type Column = NumberColumn | ColorColumn | StringColumn;
export type AnyColumn = AnyNumberColumn & ColorColumn & StringColumn;

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
        case DataType.String:
            return new StringColumn(name);
        default:
            return undefined;
    }
}

export function rebuildColumn(column: unknown): Column {
    const oc = column as {
        _type: DataType,
        _chunks: Chunk[],
        _name: string
    };
    const nc = buildColumn(oc._name, oc._type);
    return Object.assign(nc, column);
}
