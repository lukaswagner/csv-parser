import { DataType } from '../types/dataType';
import { hex2rgba } from './color';

export function inferType(input: string): DataType {
    if (input.startsWith('#')) {
        const col = hex2rgba(input, true);
        if (col[0] !== 0 || col[1] !== 0 || col[2] !== 0 || col[3] !== 0) {
            return DataType.Color;
        }
    }

    if (!Number.isNaN(Number(input))) {
        return DataType.Number;
    }

    return DataType.String;
}

export function lowestType(a: DataType, b: DataType): DataType {
    if (a === DataType.String || b === DataType.String) return DataType.String;
    if (a === DataType.Number || b === DataType.Number) return DataType.Number;
    if (a === DataType.Color || b === DataType.Color) return DataType.Color;
    return DataType.String;
}
