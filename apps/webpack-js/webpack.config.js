'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function () {
    return {
        entry: './index.js',
        mode: 'production',
        module: {
            rules: [{ test: /\.csv$/, type: 'asset/resource' }],
        },
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            alias: {
                '1m.csv': '../data/1m.csv',
            },
            fallback: {
                '1m.csv': '../data/fallback.csv',
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: 'index.html',
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
