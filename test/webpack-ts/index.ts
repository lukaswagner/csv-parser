import pako from 'pako';

import { Column, ColumnHeader, CSV, DataType, isNumber, LoadStatistics } from '../..';
import { NumberColumn } from '../../lib/types/types/column/numberColumn';
import conf from '../conf.json';

const dataSources = {
    '[remote url stream]': conf.url,
    '[1m gzip buffer]': fetch(require('1m.csv.gz'))
        .then((res) => res.arrayBuffer())
        .then((buf) => pako.inflate(new Uint8Array(buf)).buffer),
    '[10m url stream]': require('10m.csv'),
    '[50m url stream]': require('50m.csv'),
    '[100m url stream]': require('100m.csv'),
    '[google sheet]': {
        apiKey: process.env.API_KEY,
        sheetId: process.env.SHEET_ID,
    },
};

type DataSource = keyof typeof dataSources;

const loader = new CSV<DataSource>({
    dataSources,
    includesHeader: true,
    delimiter: ',',
});

// Register event handlers
for (const sourceId of Object.keys(dataSources) as DataSource[]) {
    loader.on('opened', sourceId, onOpened.bind(loader));
    loader.on('columns', sourceId, (id: string, columns: Column[]) => {
        console.log(id, 'received columns');
        loader.on('done', sourceId, onDone.bind(loader, columns));
    });
    loader.on('data', sourceId, (id: string, progress: number) => {
        console.log(id, `received new data. progress: ${progress}`);
    });
    loader.on('error', sourceId, (id: string, msg: string) => {
        console.log(id, 'error:', msg);
    });
}

console.log('loader created');

function onOpened(this: typeof loader, id: string, columns: ColumnHeader[]): void {
    console.log(
        id,
        `opened source, detected ${columns.length} columns:\n` +
            columns.map((c) => `${c.name}: ${DataType[c.type]}`).join('\n')
    );
    this.load({
        columns: columns.map((c) => c.type),
        generatedColumns: [],
    });
}

type Stats = {
    id: string;
    rows: number;
    kB: number;
    time: number;
    rowsPerSecond: number;
    kBPerSecond: number;
};
const statistics = new Array<Stats>();

function onDone(this: typeof loader, columns: Column[], id: string, stats: LoadStatistics): void {
    let columnsStats = '=== column stats: ===\n';
    columnsStats += columns
        .map((c) => {
            let text = `${c.name}: ${c.length} rows`;
            const asNum = c as NumberColumn;
            if (isNumber(c.type)) text += `, min ${asNum.min}, max ${asNum.max}`;
            return text;
        })
        .join('\n');

    const timeMS =
        stats.performance.find((s) => s.label === `${id}-open`).delta +
        stats.performance.find((s) => s.label === `${id}-load`).delta;
    const timeS = timeMS / 1000;
    const kB = stats.bytes / 1000;
    const rows = columns[0].length;
    const kRows = rows / 1000;

    statistics.push({
        id,
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

    console.log(id, `done.\n${columnsStats}\n${loaderStats}`);

    console.groupCollapsed('=== performance stats: ===');
    stats.performance.forEach((m) => console.log(`${m.label}: ${m.delta} ms`));
    console.groupEnd();
}

function testLoad(id: DataSource): Promise<void> {
    return new Promise<void>((resolve) => {
        loader.on('done', id, () => resolve());
        loader.open(id);
    });
}

testLoad('[remote url stream]')
    .then(() => testLoad('[1m gzip buffer]'))
    .then(() => testLoad('[10m url stream]'))
    .then(() => testLoad('[50m url stream]'))
    .then(() => testLoad('[100m url stream]'))
    .then(() => testLoad('[google sheet]'))
    .then(() => console.table(statistics));
