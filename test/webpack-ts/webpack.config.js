'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function () {
    return {
        entry: './index.ts',
        mode: 'production',
        module: {
            rules: [
                { test: /\.pug$/, use: { loader: 'pug-loader' } },
                { test: /\.ts$/, use: { loader: 'ts-loader' } },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js', '.json'],
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: './index.pug'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: '../data', to: 'data' },
                ]
            }),
        ],
        devServer: {
            headers: {
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp'
            }
        }
    };
};
