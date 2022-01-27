import { LoadFunc, Result } from './types';

export async function load(func: LoadFunc): Promise<Result> {
    const start = Date.now();
    const result = await func();
    const time = Date.now() - start;
    return {
        time,
        rows: result.rows,
        userAgent: window.navigator.userAgent,
    };
}
