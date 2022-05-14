import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'es2020',
        outDir: 'lib',
        lib: {
            entry: './src/csv.ts',
            name: 'csv',
            formats: ['es'],
            fileName: () => 'csv.js',
        },
        sourcemap: true,
        watch: process.argv.includes('--watch') ? { include: 'src/**' } : null,
    },
});
