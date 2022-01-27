import { load as ours } from './parsers/@lukaswagner/csv-parser';
import { load as csv } from './parsers/csv';
import { load as pp } from './parsers/papaparse';
import { load } from './load';
import { Result, LoadFunc } from './types';

const fullSources = ['/1m.csv', '/5m.csv', '/10m.csv', '/25m.csv', '/50m.csv'];
const reducedSources = ['/1m.csv', '/5m.csv', '/10m.csv'];

type Data = {
    parser: string;
    typed: boolean;
    source: string;
};

type FinalResult = Result & Data;

type Configuration = Data & {
    func: LoadFunc;
};

const configurations = new Map<string, Configuration>();

fullSources.forEach((source) =>
    configurations.set(`[ours, typed] ${source}`, {
        parser: '@lukaswagner/csv-parser',
        source,
        typed: true,
        func: ours.bind(undefined, source),
    })
);

reducedSources.forEach((source) =>
    configurations.set(`[csv, untyped] ${source}`, {
        parser: 'csv',
        source,
        typed: false,
        func: csv.bind(undefined, source, undefined),
    })
);

reducedSources.forEach((source) =>
    configurations.set(`[csv, typed] ${source}`, {
        parser: 'csv',
        source,
        typed: true,
        func: csv.bind(undefined, source, true),
    })
);

reducedSources.forEach((source) =>
    configurations.set(`[pp, untyped] ${source}`, {
        parser: 'papaparse',
        source,
        typed: false,
        func: pp.bind(undefined, source, false),
    })
);

reducedSources.forEach((source) =>
    configurations.set(`[pp, typed] ${source}`, {
        parser: 'papaparse',
        source,
        typed: true,
        func: pp.bind(undefined, source, true),
    })
);

declare global {
    interface Window {
        configurations: () => string[];
        run: (configuration: string, cb: (result: FinalResult) => void) => void;
    }
}

window.configurations = (): string[] => {
    return [...configurations.keys()];
};

function toData(v: Configuration): Data {
    const r = Object.assign({}, v);
    delete r.func;
    return r;
}

window.run = (configuration: string, cb: (result: FinalResult) => void): void => {
    const conf = configurations.get(configuration);
    load(conf.func).then((result) => {
        cb(Object.assign({}, toData(conf), result));
    });
};
