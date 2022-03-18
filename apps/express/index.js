import { CSV } from './csv.js';

const loader = new CSV({
    includesHeader: true,
    delimiter: ',',
});

loader.addDataSource('local', '/1m.csv');

async function loadDataSource(id) {
    const detectedColumns = await loader.open(id);
    console.log(id, 'opened, found', detectedColumns.length, 'columns');

    await loader.load({
        columns: detectedColumns,
        onUpdate: (progress) => console.log(id, `received new data. progress: ${progress}`),
    });

    console.log(id, 'done');
}

async function load() {
    return loadDataSource('remote').then(() => loadDataSource('local'));
}

fetch('/conf.json').then((c) => {
    c.text()
        .then((t) => {
            const json = JSON.parse(t);
            loader.addDataSource('remote', json.url);
            return load();
        })
        .then(() => console.log('all done'));
});
