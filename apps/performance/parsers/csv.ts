import { parse, Parser } from 'csv-parse/browser/esm';
import { Buffer } from 'buffer';

export async function load(url: string, cast: boolean): Promise<number> {
    let parser: Parser;
    const result = new Promise<number>(
        (resolve) =>
            (parser = parse(
                {
                    delimiter: ',',
                    cast,
                    fromLine: 2, // skip header
                },
                (err, records) => resolve(records.length)
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
