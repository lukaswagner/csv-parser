import { DataType } from '../types/dataType';
import { hex2rgba } from './color';

export function inferType(input: string): DataType {
    if (input.startsWith('#')) {
        const col = hex2rgba(input, true);
        if (col[0] !== 0 || col[1] !== 0 || col[2] !== 0 || col[3] !== 0) {
            return DataType.Color;
        }
    }

    // prefer parsing as number over date - every number can also parsed as date
    if (!Number.isNaN(Number(input))) {
        return DataType.Number;
    }

    if (!isNaN(Date.parse(input))) {
        return DataType.Date;
    }

    return DataType.String;
}

export function lowestType(a: DataType, b: DataType): DataType {
    // either is undefined -> choose the other
    if (a === undefined) return b;
    if (b === undefined) return a;

    // both the same?
    const set = new Set([a, b]);
    if (set.size === 1) return set.values().next().value;

    // different, but both compatible with date?
    if (set.has(DataType.Date) && set.has(DataType.Number)) return DataType.Date;

    // types seem to be incompatible -> fall back to string
    return DataType.String;
}
