import type { Measurement } from '../helper/perfMon';
import type { Column } from './column/column';
import type { DataType } from './dataType';

export type ColumnHeader = { name: string; type: DataType };
export type LoadStatistics = {
    chunks: number;
    bytes: number;
    workers: number;
    performance: Measurement[];
};

export type LoadResult = { columns: Column[]; statistics: LoadStatistics };
