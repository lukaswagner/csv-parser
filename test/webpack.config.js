'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function () {
    const plugins = [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './index.pug',
            inject: false
        })
    ];
    return {
        entry: './index.ts',
        mode: 'production',
        module: {
            rules: [
                {
                    test: /\.pug$/,
                    use: {
                        loader: 'pug-loader'
                    },
                }
            ],
        },
        plugins
    };
}
