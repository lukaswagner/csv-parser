const { CSV } = require('@lukaswasgner/csv-parser');

const loader = new CSV({
    includesHeader: true,
    delimiter: ',',
});

async function load() {
    loader.addDataSource('data', require('1m.csv'));

    const detectedColumns = await loader.open('data');
    console.log('opened');

    const [, dispatch] = loader.load({
        columns: detectedColumns.map(({ type }) => type),
        generatedColumns: [],
    });

    for await (const value of dispatch()) {
        if (value.type === 'data') {
            console.log(`received new data. progress: ${value.progress}`);
        } else {
            console.log('done');
        }
    }
}

load();
