import fs from 'node:fs';
import os from 'node:os';
import geckodriver from 'geckodriver';
import { remote } from 'webdriverio';

const browsers = [
    {
        browserName: 'chrome',
    },
    {
        browserName: 'firefox',
    },
];

const warmupPasses = 1;
const benchmarkPasses = 3;

async function fetchConfigs() {
    const browser = await remote({
        capabilities: {
            browserName: 'chrome',
        },
    });

    await browser.url(`http://localhost:${process.env.PORT}`);
    const configurations = await browser.execute(function () {
        // eslint-disable-next-line no-undef
        return configurations();
    });

    await browser.deleteSession();

    return configurations;
}

async function run(capabilities, conf) {
    const browser = await remote({
        capabilities,
    });

    await browser.url(`http://localhost:${process.env.PORT}`);
    await browser.setTimeout({ script: 120 * 1000 });

    try {
        const result = await browser.executeAsync(function (conf, done) {
            // eslint-disable-next-line no-undef
            run(conf, done);
        }, conf);
        result.os = os.type();
        result.osVersion = os.release();
        result.browser = browser.capabilities.browserName;
        result.browserVersion = browser.capabilities.browserVersion;
        result.arch = os.arch();
        result.cpu = os.cpus()[0].model;
        result.cores = os.cpus().length;
        result.memory = os.totalmem();

        return result;
    } finally {
        await browser.deleteSession();
    }
}

function toCSV(data) {
    const keys = Object.keys(data[0]);
    let str = keys.join(',') + '\n';
    for (const d of data) {
        keys.forEach((k, i, a) => {
            let s = d[k]?.toString() ?? '';
            if (s.includes(',')) {
                s = s.replaceAll('"', '\\"');
                s = '"' + s + '"';
            }
            str = str.concat(s);
            if (i < a.length - 1) str = str.concat(',');
        });
        str = str.concat('\n');
    }
    return str;
}

(async () => {
    const configurations = await fetchConfigs();

    const results = [];

    for (const capabilities of browsers) {
        if (capabilities.browserName === 'firefox') {
            geckodriver.start();
            await new Promise((res) => setTimeout(res, 1000));
        }

        for (const conf of configurations) {
            console.log('running', conf, 'in', capabilities.browserName);

            for (let pass = 0; pass < warmupPasses + benchmarkPasses; pass++) {
                try {
                    const result = await run(capabilities, conf);
                    if (result.error) {
                        console.log(conf, 'error:');
                        console.log(result.error);
                    } else if (result.rows === 0) {
                        console.log(conf, 'empty result:');
                        console.log(result);
                    } else {
                        if (pass >= warmupPasses) results.push(result);
                    }
                } catch (e) {
                    console.log(conf, 'error:');
                    console.log(e);
                }
            }
        }

        if (capabilities.browserName === 'firefox') geckodriver.stop();
    }

    const dir = './results';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const now = Date.now().toString();
    fs.writeFileSync(`${dir}/${now}.json`, JSON.stringify(results));
    fs.writeFileSync(`${dir}/${now}.csv`, toCSV(results));
})();
