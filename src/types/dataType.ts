export enum DataType {
    Number,
    Int8,
    Uint8,
    Int16,
    Uint16,
    Int32,
    Uint32,
    Float32,
    Float64,
    Color,
    String,
}

export type ColumnGenerator = {
    name: string,
    type: DataType,
    func: (orig: string[], parsed: unknown[]) => unknown
}

export type ColumnTypes = {
    columns: DataType[],
    generatedColumns: ColumnGenerator[]
}

export function bytes(type: DataType): number {
    switch (type) {
        case DataType.Int8:
        case DataType.Uint8:
            return 1;
        case DataType.Int16:
        case DataType.Uint16:
            return 2;
        case DataType.Int32:
        case DataType.Uint32:
        case DataType.Float32:
        case DataType.Number:
            return 4;
        case DataType.Float64:
            return 8;
        case DataType.Color:
            return 16;
        case DataType.String:
        default:
            return 0;
    }
}
