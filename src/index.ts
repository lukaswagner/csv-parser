import Worker from './worker/main/worker.ts';
const worker = new Worker();

export function test(text: string): void {
    console.log('lib:', text);
    worker.onmessage = (e: MessageEvent<any>) => console.log('lib:', e.data);
    worker.postMessage('lib -> main');
}
