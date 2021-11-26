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
                { test: /\.pug$/, use: { loader: 'pug-loader' } },
                { test: /\.ts$/, use: { loader: 'ts-loader' } },
                { test: /\.gz$/, type: 'asset/resource' },
                { test: /\.csv$/, type: 'asset/resource' },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            alias: {
                '1m.csv.gz': resolveFile('./test/data/1m.csv.gz'),
                '10m.csv': resolveFile('./test/data/10m.csv'),
                '50m.csv': resolveFile('./test/data/50m.csv'),
                '100m.csv': resolveFile('./test/data/100m.csv'),
            },
            fallback: {
                '10m.csv': resolveFile('./test/data/fallback.csv'),
                '50m.csv': resolveFile('./test/data/fallback.csv'),
                '100m.csv': resolveFile('./test/data/fallback.csv'),
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
                'Cross-Origin-Embedder-Policy': 'require-corp'
            }
        },
        performance: {
            assetFilter: assetFilename => !assetFilename.endsWith('.gz')
        }
    };
}
