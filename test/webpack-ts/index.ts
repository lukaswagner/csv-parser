import {
    Column,
    CsvLoaderOptions,
    DataType,
    TypeDeduction,
    UpdateCallback,
    loadUrl,
} from '../..';

const conf = require('../conf');

const options = new CsvLoaderOptions({
    includesHeader: true,
    delimiter: ','
});

const update: UpdateCallback = (progress: number) => {
    console.log('progress:', progress);
};

const success = (columns: Column[]): void => {
    console.log('Columns:\n' + columns
        .map((c) => `${c.name}: ${DataType[c.type]}`)
        .join('\n'));
};

const failure = (reason: unknown): void => {
    console.log(reason);
};

loadUrl(conf.url, options, update, TypeDeduction.KeepAll)
    .then(success, failure);
