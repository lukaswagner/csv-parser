import { DataSource } from '../csv';

export interface CsvLoaderOptions {
    dataSources: Record<string, DataSource>;
    includesHeader: boolean;
    typeInferLines: number;
    verbose: boolean;

    delimiter?: string;
    size?: number;
}
