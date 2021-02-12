'use strict';

const path = require('path');

module.exports = function () {
    return {
        entry: './src/csv.ts',
        output: {
            path: path.resolve(__dirname, 'lib'),
            filename: 'csv.js',
            library: 'csv',
            libraryTarget: 'umd'
        },
        optimization: {
            minimize: false
        },
        module: {
            rules: [
                { test: /\.ts$/, use: { loader: 'ts-loader' } },
            ],
        },
    };
}
