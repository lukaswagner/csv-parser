import * as pp from 'papaparse';

export async function load(url: string, dynamicTyping: boolean): Promise<number> {
    return new Promise<number>((resolve) =>
        pp.parse(url, {
            download: true,
            delimiter: ',',
            header: true,
            dynamicTyping,
            complete: (result) => resolve(result.data.length),
        })
    );
}
