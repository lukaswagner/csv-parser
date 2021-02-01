import { Chunk } from "../chunk/chunk";
import { DataType } from "../dataType";
import { ColorColumn } from "./colorColumn";
import { NumberColumn } from "./numberColumn";
import { StringColumn } from "./stringColumn";

export type Column = NumberColumn | ColorColumn | StringColumn;

export function buildColumn(name: string, type: DataType): Column {
    switch (type) {
        case DataType.Number:
            return new NumberColumn(name);
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
