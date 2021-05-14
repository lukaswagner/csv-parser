'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function () {
    return {
        entry: './index.js',
        mode: 'production',
        plugins: [
            new HtmlWebpackPlugin({
                filename: 'index.html',
            })
        ],
    };
};
