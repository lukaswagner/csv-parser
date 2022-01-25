import { load as parseOwn } from './parsers/@lukaswagner/csv-parser';
import { load as parseCSV } from './parsers/csv';
import { load as parsePP } from './parsers/papaparse';

const parsers = new Map([
    ['@lukaswagner/csv-parser', parseOwn],
    ['csv (type casting disabled)', (url) => parseCSV(url, undefined)],
    ['csv (type casting enabled)', (url) => parseCSV(url, true)],
    ['papaparse (type casting disabled)', (url) => parsePP(url, false)],
    ['papaparse (type casting enabled)', (url) => parsePP(url, true)],
]);
const sources = ['/1m.csv', '/5m.csv', '/10m.csv', '/25m.csv', '/50m.csv'];

const select = document.getElementById('parse-select') as HTMLSelectElement;
const source = document.getElementById('parse-source') as HTMLSelectElement;
const start = document.getElementById('parse-start') as HTMLButtonElement;
const time = document.getElementById('parse-time') as HTMLSpanElement;
const rows = document.getElementById('parse-rows') as HTMLSpanElement;
const rps = document.getElementById('parse-rps') as HTMLSpanElement;

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

function readable(value: number): string {
    const int = Math.floor(value);
    if (int < 1000) return int.toString();
    return (
        readable(int / 1000) +
        ' ' +
        Math.floor(int % 1000)
            .toString()
            .padStart(3, '0')
    );
}

start.onclick = () => {
    const load = parsers.get(select.value);
    const url = source.value;
    const start = Date.now();
    load(url).then((length) => {
        const dt = Date.now() - start;
        time.innerText = `${dt} ms`;
        rows.innerText = readable(length);
        rps.innerText = `${readable(length / (dt / 1000))} rows/s`;
    });
};
