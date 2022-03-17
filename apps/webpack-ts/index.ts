import conf from '@csv-parser/data/conf.json';
import {
    Column,
    createDataSources,
    CSV,
    isNumber,
    LoadStatistics,
    NumberColumn,
} from '@lukaswagner/csv-parser';
import pako from 'pako';

const googleSheetAvailable =
    process.env.GOOGLE_API_KEY !== undefined && process.env.GOOGLE_SHEET_URL !== undefined;
const excelSheetAvailable =
    process.env.EXCEL_API_KEY !== undefined && process.env.EXCEL_SHEET_URL !== undefined;

const dataSources = createDataSources({
    '[remote url stream]': conf.url,
    '[1m gzip buffer]': () =>
        fetch(require('1m.csv.gz'))
            .then((res) => res.arrayBuffer())
            .then((buf) => pako.inflate(new Uint8Array(buf)).buffer),
    '[1m url stream]': require('1m.csv'),
    '[5m url stream]': require('5m.csv'),
    '[10m url stream]': require('10m.csv'),
    '[google sheet]': {
        apiKey: process.env.GOOGLE_API_KEY,
        sheetUrl: process.env.GOOGLE_SHEET_URL,
    },
    '[excel sheet]': {
        apiKey: process.env.EXCEL_API_KEY,
        sheetUrl: process.env.EXCEL_SHEET_URL,
    },
});

type DataSource = keyof typeof dataSources;

const loader = new CSV<DataSource>({
    dataSources,
    includesHeader: true,
    delimiter: ',',
});

console.log('loader created');

type Stats = {
    id: string;
    rows: number;
    kB: number;
    time: number;
    rowsPerSecond: number;
    kBPerSecond: number;
};
const statistics = new Array<Stats>();

function logResult(columns: Column[], id: string, stats: LoadStatistics): void {
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

async function testLoad(id: DataSource): Promise<void> {
    try {
        const detectedColumns = await loader.open(id);

        console.log(
            id,
            `opened source, detected ${detectedColumns.length} columns:\n` +
                detectedColumns.map(({ name, type }) => `${name}: ${type}`).join('\n')
        );

        const { columns, statistics } = await loader.load({
            columns: detectedColumns,
            onInit: () => console.log(id, 'received columns'),
            onUpdate: (progress) => console.log(id, `received new data. progress: ${progress}`),
        });

        logResult(columns, id, statistics);
    } catch (error) {
        console.log(id, 'error:', error);
    }
}

testLoad('[remote url stream]')
    .then(() => testLoad('[1m gzip buffer]'))
    .then(() => testLoad('[5m url stream]'))
    .then(() => testLoad('[10m url stream]'))
    .then(() => (googleSheetAvailable ? testLoad('[google sheet]') : Promise.resolve()))
    .then(() => (excelSheetAvailable ? testLoad('[excel sheet]') : Promise.resolve()))
    .then(() => console.table(statistics));
