import * as pp from 'papaparse';
import { ImmediateResult } from '../types';

export async function load(url: string, dynamicTyping: boolean): Promise<ImmediateResult> {
    return new Promise<ImmediateResult>((resolve) =>
        pp.parse(url, {
            download: true,
            delimiter: ',',
            header: true,
            dynamicTyping,
            skipEmptyLines: true,
            complete: (result) =>
                resolve({
                    error:
                        result.errors?.length > 0
                            ? result.errors?.map((e) => e.message).join('\n')
                            : undefined,
                    rows: result.data.length,
                }),
        })
    );
}
