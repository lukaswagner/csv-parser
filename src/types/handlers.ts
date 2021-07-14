import { Column } from './column/column';
import { DataType } from './dataType';

export type ColumnHeader = { name: string, type: DataType };
export type OpenedHandler = (detectedColumns: ColumnHeader[]) => void;
export type ColumnsHandler = (columns: Column[]) => void;
export type DataHandler = (progress: number) => void;
export type DoneHandler = () => void;
export type ErrorHandler = (msg: string) => void;
export type EventHandler =
    OpenedHandler | ColumnsHandler | DataHandler | DoneHandler | ErrorHandler;
