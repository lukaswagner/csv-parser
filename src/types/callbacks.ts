import { Column } from './column/column';
import { DataType } from './interface/dataType';

export type UpdateCallback = (progress: number) => void;
export type ResolveCallback = (data: Column[]) => void;
export type RejectCallback = (reason?: string) => void;

export type ColumnGenerator = {
    name: string,
    type: DataType,
    func: (orig: string[], parsed: unknown[]) => unknown
}

export type TypeDeductionCallback = (types: DataType[]) => {
    columns: DataType[], generatedColumns: ColumnGenerator[]
}

export class TypeDeduction {
    public static IgnoreStrings: TypeDeductionCallback = (types) => {
        return {
            columns: types.map((t) => t === DataType.String ? undefined : t),
            generatedColumns: []
        };
    };
    public static KeepAll: TypeDeductionCallback = (types) => {
        return {
            columns: types,
            generatedColumns: []
        };
    }
}
