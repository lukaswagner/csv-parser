'use strict';

import HtmlWebpackPlugin from 'html-webpack-plugin';

import { resolveFile } from '../../scripts/helper.js';

export default function () {
    return {
        entry: './index.js',
        mode: 'production',
        target: 'web',
        module: {
            rules: [{ test: /\.csv$/, type: 'asset/resource' }],
        },
        resolve: {
            extensions: ['.ts', '.js', '.json', '.csv'],
            alias: {
                '1m.csv': resolveFile('./apps/data/1m.csv'),
            },
            fallback: {
                '1m.csv': resolveFile('./apps/data/fallback.csv'),
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
}
