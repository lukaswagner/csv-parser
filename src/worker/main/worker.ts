import { MessageData as MainMessageData } from './interface';
import { MessageData as SubMessageData } from '../sub/interface';

// @ts-expect-error The path to the worker source is only during build.
const subWorker = new Worker(SUB_WORKER_SOURCE);

const mainWorker: Worker = self as unknown as Worker;

mainWorker.onmessage = (e: MessageEvent<MainMessageData>) => {
    console.log('main:', e.data);

    subWorker.onmessage = (e: MessageEvent<SubMessageData>) => {
        console.log('main:', e.data);
        postMessage('main -> lib');
    };

    subWorker.postMessage('main -> sub');
};

export default mainWorker;
