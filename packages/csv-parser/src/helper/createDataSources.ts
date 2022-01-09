import type { DataSource } from '../types/dataSource';

/**
 * This helper function is a Constrained Identity Function (CIF), which gives compiler hints if an
 * invalid data source was used but retains the individual object keys as type.
 *
 * @param sources - An plain object with data sources.
 * @returns The same plain object but with proper type annotations.
 */
export function createDataSources<DataSources extends Record<string, DataSource>>(
    sources: DataSources
): DataSources {
    return sources;
}
