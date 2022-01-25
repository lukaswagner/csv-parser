import * as pp from 'papaparse';

export async function load(url: string, dynamicTyping: boolean): Promise<void> {
    return new Promise<void>((resolve) =>
        pp.parse(url, {
            download: true,
            delimiter: ',',
            header: true,
            dynamicTyping,
            complete: () => resolve(),
        })
    );
}
