import * as MainInterface from './interface';
import * as SubInterface from '../sub/interface';

// @ts-expect-error The path to the worker source is only during build.
const subWorker = new Worker(SUB_WORKER_SOURCE);

const mainWorker: Worker = self as unknown as Worker;

mainWorker.onmessage = (e: MessageEvent<MainInterface.MessageData>) => {
    const msg = e.data;
    switch (msg.type) {
        case MainInterface.MessageType.Setup:
            console.log('got setup message');
            break;
        case MainInterface.MessageType.AddChunk:
            console.log('got addChunk message');
            break;
        default:
            console.log('received invalid msg from frontend thread:', msg);
            break;
    }
    // subWorker.onmessage = (e: MessageEvent<SubInterface.MessageData>) => {
    //     console.log('main:', e.data);
    //     postMessage('main -> lib');
    // };

    // subWorker.postMessage('main -> sub');
};

export default mainWorker;
