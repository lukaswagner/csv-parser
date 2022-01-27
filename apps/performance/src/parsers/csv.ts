import { parse, Parser } from 'csv-parse/browser/esm';
import { Buffer } from 'buffer';
import { ImmediateResult } from '../types';

export async function load(url: string, cast: boolean): Promise<ImmediateResult> {
    let parser: Parser;
    const result = new Promise<ImmediateResult>(
        (resolve) =>
            (parser = parse(
                {
                    delimiter: ',',
                    cast,
                    fromLine: 2, // skip header
                },
                (error, records) =>
                    resolve({
                        error: error?.message,
                        rows: records.length,
                    })
            ))
    );

    const response = await fetch(url);
    const stream = response.body;

    const reader = stream.getReader();
    reader.read().then(function processText({ done, value }): void {
        if (done) {
            parser.end();
            return;
        }
        parser.write(Buffer.from(value));
        reader.read().then(processText);
    });

    return result;
}
