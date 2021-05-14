import { MessageData } from './interface';

const subWorker: Worker = self as unknown as Worker;

subWorker.onmessage = (e: MessageEvent<MessageData>) => {
    console.log('sub:', e.data);
    postMessage('sub -> main');
};

export default subWorker;
