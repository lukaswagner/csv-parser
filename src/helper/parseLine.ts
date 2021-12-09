import { DataType, isFloat, isInt } from '../types/dataType';
import { hex2rgba } from './color';

export function parseLine(line: string[], types: DataType[]): unknown[] {
    return line.map((cell, i) => {
        if (isFloat(types[i])) return Number.parseFloat(cell);
        if (isInt(types[i])) return Number.parseInt(cell);
        if (types[i] === DataType.Color) return hex2rgba(cell);
        if (types[i] === DataType.String) return undefined;
        return undefined;
    });
}
