import { Measurement } from '../helper/perfMon';
import { Column } from './column/column';
import { DataType } from './dataType';

export type ColumnHeader = { name: string; type: DataType };
export type OpenedHandler = (id: string, detectedColumns: ColumnHeader[]) => void;
export type ColumnsHandler = (id: string, columns: Column[]) => void;
export type DataHandler = (id: string, progress: number) => void;
export type LoadStatistics = {
    chunks: number;
    bytes: number;
    workers: number;
    performance: Measurement[];
};
export type DoneHandler = (id: string, stats: LoadStatistics) => void;
export type ErrorHandler = (id: string, msg: string) => void;
export type EventHandler =
    | OpenedHandler
    | ColumnsHandler
    | DataHandler
    | DoneHandler
    | ErrorHandler;
