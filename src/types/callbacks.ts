import { ColumnTypes, DataType } from './interface/dataType';
import { Column } from './column/column';

export type UpdateCallback = (progress: number) => void;
export type ResolveCallback = (data: Column[]) => void;
export type RejectCallback = (reason?: string) => void;

export type TypeDeductionCallback = (types: DataType[]) => ColumnTypes;

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
