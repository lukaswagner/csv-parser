import pako from 'pako';

import {
    Column,
    ColumnHeader,
    CSV,
    CsvLoaderOptions,
    DataType,
    isNumber,
    LoadStatistics,
} from '../..';
import { NumberColumn } from '../../lib/types/types/column/numberColumn';
import conf from '../conf.json';

const options = new CsvLoaderOptions({
    includesHeader: true,
    delimiter: ',',
});

function onOpened(this: CSV, tag: string, columns: ColumnHeader[]): void {
    console.log(
        tag,
        `opened source, detected ${columns.length} columns:\n` +
            columns.map(c => `${c.name}: ${DataType[c.type]}`).join('\n')
    );
    this.load({
        columns: columns.map(c => c.type),
        generatedColumns: [],
    });
}

type Stats = {
    tag: string;
    rows: number;
    kB: number;
    time: number;
    rowsPerSecond: number;
    kBPerSecond: number;
};
const statistics = new Array<Stats>();

function onDone(
    this: CSV,
    tag: string,
    done: () => void,
    columns: Column[],
    stats: LoadStatistics
): void {
    let columnsStats = '=== column stats: ===\n';
    columnsStats += columns
        .map(c => {
            let text = `${c.name}: ${c.length} rows`;
            const asNum = c as NumberColumn;
            if (isNumber(c.type)) text += `, min ${asNum.min}, max ${asNum.max}`;
            return text;
        })
        .join('\n');

    const timeMS =
        stats.performance.find(s => s.label === 'open').delta +
        stats.performance.find(s => s.label === 'load').delta;
    const timeS = timeMS / 1000;
    const kB = stats.bytes / 1000;
    const rows = columns[0].length;
    const kRows = rows / 1000;

    statistics.push({
        tag,
        rows,
        kB,
        time: timeS,
        rowsPerSecond: rows / timeS,
        kBPerSecond: kB / timeS,
    });

    const loaderStats =
        '=== loader stats: ===\n' +
        `source bytes: ${stats.bytes}\n` +
        `source chunks: ${stats.chunks}\n` +
        `number of workers: ${stats.workers}\n` +
        `read rows: ${rows}\n` +
        `kB / worker: ${(kB / stats.workers).toFixed(3)}\n` +
        `chunks / worker: ${(stats.chunks / stats.workers).toFixed(3)}\n` +
        `total time in s: ${timeS.toFixed(3)}\n` +
        `kB / s: ${(kB / timeS).toFixed(3)}\n` +
        `kRows / s: ${(kRows / timeS).toFixed(3)}\n`;

    console.log(tag, `done.\n${columnsStats}\n${loaderStats}`);

    console.groupCollapsed('=== performance stats: ===');
    stats.performance.forEach(m => console.log(`${m.label}: ${m.delta} ms`));
    console.groupEnd();

    done();
}

function createLoader(tag: string, done: () => void): CSV {
    const loader = new CSV(options);
    loader.on('opened', onOpened.bind(loader, tag));
    loader.on('columns', (columns: Column[]) => {
        console.log(tag, 'received columns');
        loader.on('done', onDone.bind(loader, tag, done, columns));
    });
    loader.on('data', (progress: number) => {
        console.log(tag, `received new data. progress: ${progress}`);
    });
    loader.on('error', (msg: string) => {
        console.log(tag, 'error:', msg);
        done();
    });
    console.log(tag, 'created');
    return loader;
}

function testUrl(tag: string, url: string): Promise<void> {
    return new Promise<void>(resolve => {
        createLoader(tag, resolve).open(url);
    });
}

function testGzipped(testCase: string, url: string): Promise<void> {
    return new Promise<void>(resolve => {
        fetch(url)
            .then(res => res.arrayBuffer())
            .then(buf =>
                createLoader(testCase, resolve).open(pako.inflate(new Uint8Array(buf)).buffer)
            );
    });
}

testUrl('[remote url stream]', conf.url)
    .then(() => testGzipped('[1m gzip buffer]', require('1m.csv.gz')))
    .then(() => testUrl('[10m url stream]', require('10m.csv')))
    .then(() => testUrl('[50m url stream]', require('50m.csv')))
    .then(() => testUrl('[100m url stream]', require('100m.csv')))
    .then(() => console.table(statistics));
