import { Column } from './column/column';
import { DataType } from './dataType';

type ColumnHeader = { name: string, type: DataType };
export type OpenedHandler = (detectedColumns: ColumnHeader[]) => void;
export type ColumnsHandler = (columns: Column[]) => void;
export type DataHandler = () => void;
export type DoneHandler = () => void;
export type ErrorHandler = (msg: string) => void;
export type EventHandler =
    OpenedHandler | ColumnsHandler | DataHandler | DoneHandler | ErrorHandler;

// export class TypeDeduction {
//     public static IgnoreStrings: TypeDeductionCallback = (types) => {
//         return {
//             columns: types.map((t) => t === DataType.String ? undefined : t),
//             generatedColumns: []
//         };
//     };
//     public static KeepAll: TypeDeductionCallback = (types) => {
//         return {
//             columns: types,
//             generatedColumns: []
//         };
//     }
// }
