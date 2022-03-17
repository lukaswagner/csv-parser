import { CSV } from '@lukaswagner/csv-parser';
import data from '1m.csv';

const loader = new CSV({
    includesHeader: true,
    delimiter: ',',
});

async function load() {
    console.log('adding data source', data);
    loader.addDataSource('data', data);

    const detectedColumns = await loader.open('data');
    console.log('opened');

    await loader.load({
        columns: detectedColumns,
        onUpdate: (progress) => console.log(`received new data. progress: ${progress}`),
    });

    console.log('done');
}

load();
