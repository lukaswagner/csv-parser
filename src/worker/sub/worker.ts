import * as Interface from './interface';

const subWorker: Worker = self as unknown as Worker;

subWorker.onmessage = (e: MessageEvent<Interface.MessageData>) => {
    const msg = e.data;
    if (e.data.type !== Interface.MessageType.Start) {
        console.log('received invalid msg from sub worker:', msg);
    }
    onStart(msg.data as Interface.StartData);
};

function onStart(data: Interface.StartData): void {
    sendFinished();
}

function sendFinished(): void {
    const data: Interface.FinishedData = {
        columns: [],
        startRemainder: new SharedArrayBuffer(0),
        endRemainder: new SharedArrayBuffer(0)
    };

    const msg: Interface.MessageData = {
        type: Interface.MessageType.Finished,
        data
    };

    postMessage(msg);
}

export default subWorker;
