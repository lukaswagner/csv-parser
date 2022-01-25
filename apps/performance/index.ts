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

const parser = document.getElementById('parser') as HTMLSelectElement;
const source = document.getElementById('source') as HTMLSelectElement;
const start = document.getElementById('start') as HTMLButtonElement;
const time = document.getElementById('time') as HTMLSpanElement;
const rows = document.getElementById('rows') as HTMLSpanElement;
const rps = document.getElementById('rps') as HTMLSpanElement;
const benchmark = document.getElementById('benchmark') as HTMLButtonElement;

parsers.forEach((_, k) => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.text = k;
    parser.add(opt);
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

async function load(parser: string, url: string): Promise<string> {
    const load = parsers.get(parser);
    const start = Date.now();
    return load(url).then((length) => {
        const dt = Date.now() - start;
        time.innerText = `${dt} ms`;
        rows.innerText = readable(length);
        rps.innerText = `${readable(length / (dt / 1000))} rows/s`;
        return [
            parser,
            url,
            `"${window.navigator.userAgent}"`,
            window.navigator.hardwareConcurrency,
            dt,
            length,
        ].join(',');
    });
}

start.onclick = () => {
    load(parser.value, source.value).then(console.log);
};

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// seems to run out of memory, happens in chrome and firefox
benchmark.onclick = async () => {
    let result = ['parser', 'url', 'userAgent', 'threads', 'time', 'rows'].join(',');
    for (const parser of parsers.keys()) {
        for (const source of sources) {
            const str = await load(parser, source);
            result = result.concat('\n', str);
            await sleep(5000);
        }
    }
};
