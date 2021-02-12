const worker = new Worker(new URL("./worker/main/worker", import.meta.url));

export function test(text: string): void {
    console.log('lib:', text);
    worker.onmessage = (e: MessageEvent<any>) => console.log('lib:', e.data);
    worker.postMessage('lib -> main');
}
