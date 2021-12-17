import { Measurement } from '../helper/perfMon';
import { DataType } from './dataType';

export type ColumnHeader = { name: string; type: DataType };
export type DataHandler = (id: string, progress: number) => void;
export type LoadStatistics = {
    chunks: number;
    bytes: number;
    workers: number;
    performance: Measurement[];
};
export type DoneHandler = (id: string, stats: LoadStatistics) => void;
export type ErrorHandler = (id: string, msg: string) => void;
export type EventHandler = DataHandler | DoneHandler | ErrorHandler;
