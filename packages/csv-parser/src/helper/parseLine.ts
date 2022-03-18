import { DataType, isFloat, isInt } from '../types/dataType';
import { hex2rgba } from './color';

export function parseLine(line: string[], types: DataType[]): unknown[] {
    return line.map((cell, i) => {
        if (isFloat(types[i])) return Number.parseFloat(cell);
        if (isInt(types[i])) return Number.parseInt(cell);
        switch (types[i]) {
            case DataType.Color:
                return hex2rgba(cell);
            case DataType.Date: {
                let n = Date.parse(cell);
                if (isNaN(n)) n = Number.parseInt(cell);
                return new Date(n);
            }
            case DataType.String:
                return cell;
            default:
                return undefined;
        }
    });
}
