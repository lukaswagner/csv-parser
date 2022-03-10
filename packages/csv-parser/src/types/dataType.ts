export enum DataType {
    Number = 'number',
    Int8 = 'int8',
    Uint8 = 'uint8',
    Int16 = 'int16',
    Uint16 = 'uint16',
    Int32 = 'int32',
    Uint32 = 'uint32',
    Float32 = 'float32',
    Float64 = 'float64',
    Color = 'color',
    String = 'string',
    Date = 'date',
}

export type ColumnGenerator = {
    name: string;
    type: DataType;
    func: (orig: string[], parsed: unknown[]) => unknown;
};

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
        case DataType.Date:
            return 8;
        case DataType.Color:
            return 16;
        case DataType.String:
        default:
            return 0;
    }
}

export function isFloat(type: DataType): boolean {
    switch (type) {
        case DataType.Number:
        case DataType.Float32:
        case DataType.Float64:
            return true;
        default:
            return false;
    }
}

export function isInt(type: DataType): boolean {
    switch (type) {
        case DataType.Int8:
        case DataType.Uint8:
        case DataType.Int16:
        case DataType.Uint16:
        case DataType.Int32:
        case DataType.Uint32:
            return true;
        default:
            return false;
    }
}

export function isNumber(type: DataType): boolean {
    switch (type) {
        case DataType.Number:
        case DataType.Int8:
        case DataType.Uint8:
        case DataType.Int16:
        case DataType.Uint16:
        case DataType.Int32:
        case DataType.Uint32:
        case DataType.Float32:
        case DataType.Float64:
            return true;
        default:
            return false;
    }
}
