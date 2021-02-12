'use strict';

const path = require('path');

module.exports = function () {
    return {
        entry: './lib/loose/csv.js',
        mode: 'production',
        devtool: 'source-map',
        output: {
            path: path.resolve(__dirname, 'lib/bundled'),
            filename: 'csv.js',
            library: 'csv',
            libraryTarget: 'umd',
        },
    };
}
