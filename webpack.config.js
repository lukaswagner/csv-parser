'use strict';

const path = require('path');
const { DefinePlugin } = require('webpack');
const { merge } = require('webpack-merge');

module.exports = function () {
    const shared =
    {
        entry: {
            csv: './src/csv.ts',
            main: './src/worker/main/worker.ts',
            sub: './src/worker/sub/worker.ts',
        },
        mode: 'production',
        devtool: 'source-map',
        resolve: {
            extensions: ['.ts']
        },
        output: {
            filename: '[name].js',
            library: 'csv',
            libraryTarget: 'umd',
        },
        module: {
            rules: [
                { test: /\.ts$/, use: { loader: 'ts-loader' } },
            ],
        },
    };

    const standalone = {
        name: 'standalone',
        output: {
            path: path.resolve(__dirname, 'lib/standalone'),
        },
        plugins: [
            new DefinePlugin({
                MAIN_WORKER_SOURCE: '"main.js"',
                SUB_WORKER_SOURCE: '"sub.js"'
            })
        ]
    };

    const webpack = {
        name: 'webpack',
        output: {
            path: path.resolve(__dirname, 'lib/webpack'),
        },
        plugins: [
            new DefinePlugin({
                MAIN_WORKER_SOURCE: 'new URL("main.js", import.meta.url)',
                SUB_WORKER_SOURCE: 'new URL("sub.js", import.meta.url)'
            })
        ]
    };

    return [
        merge(shared, standalone),
        merge(shared, webpack)
    ];
};
