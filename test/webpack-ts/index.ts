import * as pako from 'pako';

import {
    CSV,
    Column,
    ColumnHeader,
    CsvLoaderOptions,
    DataType,
    LoadStatistics,
    isNumber
} from '../..';
import { NumberColumn } from '../../lib/types/types/column/numberColumn';

const conf = require('../conf');

const options = new CsvLoaderOptions({
    includesHeader: true,
    delimiter: ','
});

function createLoader(tag: string, done: () => void): CSV {
    const loader = new CSV(options);
    let storedColumns: Column[];
    loader.on('opened', (columns: ColumnHeader[]) => {
        console.log(
            tag,
            `opened source, detected ${columns.length} columns:\n` +
            columns.map((c) => `${c.name}: ${DataType[c.type]}`).join('\n'));
        loader.load({
            columns: columns.map((c) => c.type),
            generatedColumns: []
        });
    });
    loader.on('columns', (columns: Column[]) => {
        storedColumns = columns;
        console.log(tag, 'received columns');
    });
    loader.on('data', (progress: number) => {
        console.log(tag, `received new data. progress: ${progress}`);
    });
    loader.on('done', (stats: LoadStatistics) => {
        const columnsStats =
            '=== column stats: ===\n' +
            storedColumns.map((c) => {
                const base = `${c.name}: ${c.length} rows`;
                const asNum = c as NumberColumn;
                const num = isNumber(c.type) ?
                    `, min ${asNum.min}, max ${asNum.max}` : '';
                return base + num;
            }).join('\n');
        const loaderStats =
            '=== loader stats: ===\n' +
            `source bytes: ${stats.bytes}\n` +
            `source chunks: ${stats.chunks}\n` +
            `number of workers: ${stats.workers}\n` +
            `bytes per worker: ${(stats.bytes / stats.workers).toFixed(2)}\n` +
            `chunks per worker: ${(stats.chunks / stats.workers).toFixed(2)}\n`;
        console.log(
            tag,
            `done.\n${columnsStats}\n${loaderStats}`);
        console.groupCollapsed('=== performance stats: ===');
        stats.performance.forEach(
            (m) => console.log(`${m.label}: ${m.delta} ms`));
        console.groupEnd();
        done();
    });
    loader.on('error', (msg: string) => {
        console.log(tag, 'error:', msg);
        done();
    });
    console.log(tag, 'created');
    return loader;
}

function testUrl(tag: string, url: string): Promise<void> {
    return new Promise<void>((resolve) => {
        createLoader(tag, resolve).open(url);
    });
}

function testGzipped(testCase: string, url: string): Promise<void> {
    return new Promise<void>((resolve) => {
        fetch(url)
            .then((res) => res.arrayBuffer())
            .then((buf) => createLoader(testCase, resolve).open(
                pako.inflate(new Uint8Array(buf)).buffer)
            );
    });
}

testUrl('[url stream]', conf.url)
    .then(() => testGzipped('[1m gzip buffer]', '/data/1m.csv.gz'));
