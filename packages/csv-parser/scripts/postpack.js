import { rmSync } from 'node:fs';

function remove(file) {
    console.log('removing', file);
    rmSync(file);
}

remove('README.md');
remove('CHANGELOG.md');
remove('LICENSE');
