'use strict';

import HtmlWebpackPlugin from 'html-webpack-plugin';

export default function () {
    return {
        entry: './index.ts',
        mode: 'production',
        module: {
            rules: [{ test: /\.ts$/, use: { loader: 'ts-loader' } }],
        },
        resolve: {
            extensions: ['.ts', '...'],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'index.html',
            }),
        ],
    };
}
