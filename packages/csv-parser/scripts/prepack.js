import { copyFileSync } from 'node:fs';
import { join } from 'node:path';

function copy(file) {
    console.log('copying', file);
    copyFileSync(join('..', '..', file), file);
}

copy('README.md');
copy('CHANGELOG.md');
copy('LICENSE');
