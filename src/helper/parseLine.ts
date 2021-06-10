import { DataType } from '../types/dataType';
import { hex2rgba } from './color';

export function parseLine(
    line: string[], types: DataType[]
): unknown[] {
    return line.map((cell, i) => {
        switch (types[i]) {
            case DataType.Number:
                return Number(cell);
            case DataType.Color:
                return hex2rgba(cell);
            case DataType.String:
                return undefined;
            default:
                return undefined;
        }
    });
}
