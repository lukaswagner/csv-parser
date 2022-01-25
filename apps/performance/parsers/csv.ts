import { parse } from 'csv-parse/browser/esm/sync';

export async function load(url: string, cast: boolean): Promise<void> {
    const response = await fetch(url);
    const string = await response.text();
    parse(string, {
        delimiter: ',',
        cast,
    });
}
