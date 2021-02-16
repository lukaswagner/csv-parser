// @ts-ignore
const worker = new Worker(MAIN_WORKER_SOURCE);

export function test(text: string): void {
    console.log('lib:', text);
    worker.onmessage = (e: MessageEvent<any>) => console.log('lib:', e.data);
    worker.postMessage('lib -> main');
}

export default {
    test
}
