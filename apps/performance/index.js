import { CSV } from '@lukaswagner/csv-parser';

const parsers = new Map([['@lukaswagner/csv-parser', parseOwn]]);
const sources = ['/1m.csv', '/5m.csv', '/10m.csv', '/25m.csv', '/50m.csv'];

const select = document.getElementById('parse-select');
const source = document.getElementById('parse-source');
const start = document.getElementById('parse-start');
const result = document.getElementById('parse-result');

parsers.forEach((_, k) => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.text = k;
    select.add(opt);
});

sources.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.text = s;
    source.add(opt);
});

start.onclick = () => {
    const load = parsers.get(select.value);
    const url = source.value;
    const start = Date.now();
    load(url).then(() => {
        result.innerText = `${Date.now() - start} ms`;
    });
};

async function parseOwn(url) {
    const loader = new CSV({
        includesHeader: true,
        delimiter: ',',
    });

    loader.addDataSource('data', url);

    const detectedColumns = await loader.open('data');

    const [, dispatch] = loader.load({
        columns: detectedColumns.map(({ type }) => type),
        generatedColumns: [],
    });

    // eslint-disable-next-line no-unused-vars
    for await (const _ of dispatch());
}
