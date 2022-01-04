import { Measurement } from '../helper/perfMon';
import { DataType } from './dataType';

export type ColumnHeader = { name: string; type: DataType };
export type LoadStatistics = {
    chunks: number;
    bytes: number;
    workers: number;
    performance: Measurement[];
};

export type DispatchValue =
    | { type: 'data'; progress: number }
    | { type: 'done'; statistics: LoadStatistics };

export type Dispatcher = () => AsyncGenerator<DispatchValue, void>;
