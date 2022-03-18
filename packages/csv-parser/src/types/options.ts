import type { Column } from './column/column';
import type { DataSource } from './dataSource';
import type { ColumnGenerator } from './dataType';
import type { ColumnHeader } from './handlers';

export interface CsvLoaderOptions {
    dataSources: Record<string, DataSource>;
    includesHeader: boolean;
    typeInferLines: number;
    verbose: boolean;

    delimiter?: string;
    size?: number;
}

export type LoadOptions = {
    columns: ColumnHeader[];
    generatedColumns?: ColumnGenerator[];
    onInit?: (columns: Column[]) => void;
    onUpdate?: (progress: number) => void;
};
