import { Column } from "./column/column";
import { DataType } from "./interface/dataType";

export type UpdateCallback = (progress: Number) => void;
export type ResolveCallback = (data: Column[]) => void;
export type RejectCallback = (reason?: any) => void;

export type ColumnGenerator = {
    type: DataType,
    func: (orig: string[], parsed: any[]) => any
}

export type TypeDeductionCallback = (types: DataType[]) => {
    columns: DataType[], generatedColumns: ColumnGenerator[]
}

export class TypeDeduction {
    public static IgnoreStrings: TypeDeductionCallback = (types) => {
        return {
            columns: types.map((t) => t === DataType.String ? undefined : t),
            generatedColumns: []
        }
    };
    public static KeepAll: TypeDeductionCallback = (types) => {
        return {
            columns: types,
            generatedColumns: []
        }
    }
}
