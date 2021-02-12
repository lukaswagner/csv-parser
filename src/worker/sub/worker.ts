const subWorker: Worker = self as any;

subWorker.onmessage = (e: MessageEvent<any>) => {
    console.log('sub:', e.data);
    postMessage('sub -> main');
};

export default subWorker as any;
