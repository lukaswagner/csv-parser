'use strict';

import HtmlWebpackPlugin from 'html-webpack-plugin';

export default function () {
    return {
        entry: './index.js',
        mode: 'production',
        target: 'web',
        plugins: [
            new HtmlWebpackPlugin({
                template: 'index.html',
            }),
        ],
    };
}
