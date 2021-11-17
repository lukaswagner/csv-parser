'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function () {
    return {
        entry: './index.ts',
        mode: 'production',
        module: {
            rules: [
                { test: /\.pug$/, use: { loader: 'pug-loader' } },
                { test: /\.ts$/, use: { loader: 'ts-loader' } },
                { test: /\.gz$/, type: 'asset/resource' },
                { test: /\.csv$/, type: 'asset/resource' },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            alias: {
                '1m.csv.gz': path.resolve(__dirname, '../data/1m.csv.gz'),
                '10m.csv': path.resolve(__dirname, '../data/10m.csv'),
                '50m.csv': path.resolve(__dirname, '../data/50m.csv'),
                '100m.csv': path.resolve(__dirname, '../data/100m.csv'),
            },
            fallback: {
                '10m.csv': path.resolve(__dirname, '../data/fallback.csv'),
                '50m.csv': path.resolve(__dirname, '../data/fallback.csv'),
                '100m.csv': path.resolve(__dirname, '../data/fallback.csv'),
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: './index.pug',
            }),
        ],
        devServer: {
            headers: {
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp',
            },
        },
    };
};
