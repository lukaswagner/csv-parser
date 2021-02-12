'use strict';

const path = require('path');

const tsTest = /\.ts$/;
const workerTest = /worker\.ts$/;

module.exports = function () {
    return {
        entry: './src/index.ts',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'csv.js',
            library: 'csv',
            libraryTarget: 'umd'
        },
        module: {
            rules: [
                {
                    test: (f) => tsTest.test(f) && !workerTest.test(f),
                    use: { loader: 'ts-loader' },
                },
                {
                    test: (f) => workerTest.test(f),
                    use: [
                        {
                            loader: "worker-loader",
                            options: { filename: "[name]_[contenthash:4].js" }
                        },
                        { loader: 'ts-loader' }
                    ],
                },
            ],
        },
        devtool: 'source-map'
    };
}
