import replace from '@rollup/plugin-replace';
import { build } from 'vite';

import { resolveFile } from './helper.js';

const artifacts = [
    { name: 'csv', entry: resolveFile('./src/csv.ts') },
    { name: 'main', entry: resolveFile('./src/worker/main/worker.ts') },
    { name: 'sub', entry: resolveFile('./src/worker/sub/worker.ts') },
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
                    formats: ['es'],
                    fileName: () => `${name}.js`,
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
                            __MAIN_WORKER_SOURCE: '"main.js"',
                            __SUB_WORKER_SOURCE: '"sub.js"',
                        }
                    }),
                    enforce: 'post',
                }
            ]
        });
    }
};

main();
