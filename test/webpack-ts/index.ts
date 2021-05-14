import {
    CsvLoaderOptions,
    TypeDeduction,
    UpdateCallback,
    loadUrl
} from '../..';

const conf = require('../conf');

const options: CsvLoaderOptions = {
    includesHeader: true,
    delimiter: ','
};

const update: UpdateCallback = (progress: number) => {
    console.log('progress:', progress);
};

loadUrl(conf.url, options, update, TypeDeduction.KeepAll);
