import * as pako from 'pako';

import {
    Column,
    CsvLoaderOptions,
    DataType,
    TypeDeduction,
    loadBuffer,
    loadUrl
} from '../..';

const conf = require('../conf');

const options = new CsvLoaderOptions({
    includesHeader: true,
    delimiter: ','
});

const update = (testCase: string, progress: number): void => {
    console.log(testCase + ' progress:', progress);
};

const success = (testCase: string, columns: Column[]): void => {
    console.log(testCase + ' columns:\n' + columns
        .map((c) => `${c.name}: ${DataType[c.type]}`)
        .join('\n'));
};

const failure = (testCase: string, reason: unknown): void => {
    console.log(testCase + ' error:', reason);
};

function testUrl(testCase: string, url: string): void {
    loadUrl(
        url,
        options,
        update.bind(undefined, testCase),
        TypeDeduction.KeepAll
    )
        .then(
            success.bind(undefined, testCase),
            failure.bind(undefined, testCase));
}

function testGzipped(testCase: string, url: string): void {
    fetch(url)
        .then((res) => res.arrayBuffer())
        .then((buf) => loadBuffer(
            pako.inflate(new Uint8Array(buf)).buffer,
            options,
            update.bind(undefined, testCase),
            TypeDeduction.KeepAll)
        )
        .then(
            success.bind(undefined, testCase),
            failure.bind(undefined, testCase));
}

testUrl('[url stream]', conf.url);
testGzipped('[1m gzip buffer]', '/data/1m.csv.gz');
