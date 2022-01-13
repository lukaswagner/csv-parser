import DotenvPlugin from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import { resolveFile } from '../../scripts/helper.js';

/**
 * @returns {import("webpack").Configuration}
 */
export default function () {
    return {
        entry: './index.ts',
        mode: 'production',
        module: {
            rules: [
                { test: /\.pug$/, use: [{ loader: 'html-loader' }, 'pug-plain-loader'] },
                { test: /\.ts$/, use: { loader: 'ts-loader' } },
                { test: /\.gz$/, type: 'asset/resource' },
                { test: /\.csv$/, type: 'asset/resource' },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            alias: {
                '1m.csv.gz': resolveFile('./apps/data/1m.csv.gz'),
                '1m.csv': resolveFile('./apps/data/1m.csv'),
                '5m.csv': resolveFile('./apps/data/5m.csv'),
                '10m.csv': resolveFile('./apps/data/10m.csv'),
            },
            fallback: {
                '1m.csv': resolveFile('./apps/data/fallback.csv'),
                '5m.csv': resolveFile('./apps/data/fallback.csv'),
                '10m.csv': resolveFile('./apps/data/fallback.csv'),
            },
        },
        plugins: [
            new DotenvPlugin(),
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
        performance: {
            assetFilter: (assetFilename) => !assetFilename.endsWith('.gz'),
        },
    };
}
