import { CSV } from '@lukaswagner/csv-parser';
import { ImmediateResult } from '../../types';

export async function load(url: string): Promise<ImmediateResult> {
    const loader = new CSV({
        includesHeader: true,
        delimiter: ',',
    });

    loader.addDataSource('data', url);

    const detectedColumns = await loader.open('data');

    const [columns, dispatch] = loader.load({
        columns: detectedColumns.map(({ type }) => type),
        generatedColumns: [],
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of dispatch());

    return { rows: columns[0].length };
}
