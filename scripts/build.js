const replace = require('@rollup/plugin-replace');
const path = require('path');
const { build } = require('vite');

const artifacts = [
    { name: 'csv', entry: path.resolve(__dirname, '../src/csv.ts') },
    {
        name: 'main',
        entry: path.resolve(__dirname, '../src/worker/main/worker.ts'),
    },
    {
        name: 'sub',
        entry: path.resolve(__dirname, '../src/worker/sub/worker.ts'),
    },
];

const main = async () => {
    for (const [index, { name, entry }] of artifacts.entries()) {
        await build({
            configFile: false,
            build: {
                target: 'es2020',
                emptyOutDir: index === 0,
                outDir: 'lib',
                lib: {
                    entry,
                    name: 'csv',
                    formats: ['es', 'cjs'],
                    fileName: format => `${format}/${name}.js`,
                },
                rollupOptions: {
                    // External dependencies that shouldn't be bundled go here
                    external: [],
                    output: {
                        // Global variables to use in the UMD build for externalized dependencies
                        globals: {},
                    },
                },
                sourcemap: true,
            },
            plugins: [
                {
                    ...replace({
                        preventAssignment: true,
                        values: {
                            __MAIN_WORKER_SOURCE: 'new URL("main.js", import.meta.url)',
                            __SUB_WORKER_SOURCE: 'new URL("sub.js", import.meta.url)',
                        }
                    }),
                    enforce: 'post',
                }
            ]
        });
    }
};

main();
