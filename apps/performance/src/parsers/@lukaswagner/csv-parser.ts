import { CSV } from '@lukaswagner/csv-parser';

import { ImmediateResult } from '../../types';

export async function load(url: string): Promise<ImmediateResult> {
    const loader = new CSV({
        includesHeader: true,
        delimiter: ',',
    });

    loader.addDataSource('data', url);

    const detectedColumns = await loader.open('data');
    const { columns } = await loader.load({ columns: detectedColumns });

    return { rows: columns[0].length };
}
