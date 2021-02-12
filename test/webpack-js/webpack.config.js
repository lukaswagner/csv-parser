'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function () {
    return {
        entry: './index.js',
        mode: 'production',
        optimization: {
            minimize: false
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: 'index.html',
            })
        ],
    };
}
