import type { DataSource } from './dataSource';

export interface CsvLoaderOptions {
    dataSources: Record<string, DataSource>;
    includesHeader: boolean;
    typeInferLines: number;
    verbose: boolean;

    delimiter?: string;
    size?: number;
}
