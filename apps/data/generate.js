import seedrandom from 'seedrandom';
import fs from 'node:fs';

// note: watch out for big file sizes and long generation times.
// the 100m file measures ca. 4gb and takes multiple minutes (~10) to generate.
const sizes = [1, 5, 10, 25, 50, 100];
const scale = 3;
const digits = 3;
const columns = 5;

const colHelper = [...new Array(columns)];
const header = colHelper.map((_, i) => String.fromCharCode(0x61 + i)).join(',') + '\n';

let rng;
function get() {
    return (rng() * 10 ** scale).toFixed(digits);
}

for (const size of sizes) {
    console.log(`generating ${size}m.csv...`);
    rng = seedrandom(size.toString());
    const str = fs.createWriteStream(`./${size}m.csv`);
    str.write(header);
    const rows = size * 1e6;
    for (let i = 0; i < rows; i++) {
        if ((i + 1) % (rows / 10) === 0) process.stdout.write('=');
        const row = colHelper.map(() => get()).join(',') + '\n';
        const full = !str.write(row);
        if (full) await new Promise((res) => str.once('drain', () => res()));
    }
    process.stdout.write('\n');
    str.close();
    console.log('done');
}
