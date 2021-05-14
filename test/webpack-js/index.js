import {
    TypeDeduction,
    loadUrl
} from '../..';

const conf = require('../conf');

const options = {
    includesHeader: true,
    delimiter: ','
};

const update = (progress) => {
    console.log('progress:', progress);
};

loadUrl(conf.url, options, update, TypeDeduction.KeepAll);
