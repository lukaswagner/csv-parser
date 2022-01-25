import { parse } from 'csv-parse/browser/esm/sync';

export async function load(url: string, cast: boolean): Promise<number> {
    const response = await fetch(url);
    const string = await response.text();
    const result = parse(string, {
        delimiter: ',',
        cast,
        fromLine: 2, // skip header
    });
    return result.length;
}
