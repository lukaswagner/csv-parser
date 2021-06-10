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
