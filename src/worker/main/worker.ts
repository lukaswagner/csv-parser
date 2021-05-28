import * as MainInterface from './interface';
import * as SubInterface from '../sub/interface';

const mainWorker: Worker = self as unknown as Worker;

let setup: MainInterface.SetupData;
const chunks = new Array<ArrayBufferLike>();
const targetNumWorkers = 25;
let chunksPerWorker: number;
let totalBytes = 0;
let totalChunks = 0;
let nextWorker = 0;
const runningWorkers = new Set<number>();
let allChunksHandled = false;

mainWorker.onmessage = (e: MessageEvent<MainInterface.MessageData>) => {
    const msg = e.data;
    switch (msg.type) {
        case MainInterface.MessageType.Setup:
            setup = msg.data as MainInterface.SetupData;
            break;
        case MainInterface.MessageType.AddChunk:
            onAddChunk(msg.data as MainInterface.AddChunkData);
            break;
        case MainInterface.MessageType.NoMoreChunks:
            onNoMoreChunks();
            break;
        default:
            console.log('received invalid msg from frontend thread:', msg);
            break;
    }
};

function onAddChunk(data: MainInterface.AddChunkData): void {
    chunks.push(data.chunk);

    if (!chunksPerWorker) deductChunksPerWorker(data.chunk);

    totalChunks++;
    totalBytes += data.chunk.byteLength;

    if (chunks.length < chunksPerWorker) return;

    startSubWorker();
}

function onNoMoreChunks(): void {
    startSubWorker();
    allChunksHandled = true;
}

function deductChunksPerWorker(chunk: ArrayBufferLike): void {
    if (setup.options.size) {
        const bytesPerChunk = chunk.byteLength;
        const estimatedChunks = this._size / bytesPerChunk;
        chunksPerWorker = Math.ceil(estimatedChunks / targetNumWorkers);
    } else {
        chunksPerWorker = 100;
    }
}

function startSubWorker(): void {
    const numChunks = Math.max(chunks.length, chunksPerWorker);
    const workerChunks = chunks.splice(0, numChunks);
    const workerId = nextWorker++;

    // @ts-expect-error The path to the worker source is only during build.
    const subWorker = new Worker(SUB_WORKER_SOURCE);

    subWorker.onmessage = (e: MessageEvent<SubInterface.MessageData>) => {
        const msg = e.data;
        if (e.data.type !== SubInterface.MessageType.Finished) {
            console.log('received invalid msg from sub worker:', msg);
        }
        onSubWorkerFinished(msg.data as SubInterface.FinishedData, workerId);
    };

    const data: SubInterface.StartData = {
        chunks: workerChunks,
        columns: setup.columns,
        generatedColumns: setup.generatedColumns,
        options: {
            delimiter: setup.options.delimiter,
            includesHeader: setup.options.includesHeader && workerId === 0
        }
    };

    const msg: SubInterface.MessageData = {
        type: SubInterface.MessageType.Start,
        data
    };

    console.log(`starting worker ${workerId}`);
    runningWorkers.add(workerId);
    subWorker.postMessage(msg);
}

function onSubWorkerFinished(
    data: SubInterface.FinishedData, workerId: number
): void {
    console.log(`worker ${workerId} done`);
    runningWorkers.delete(workerId);

    if (allChunksHandled && runningWorkers.size === 0) {
        console.log('All workers finished. Stats:',
            '\nchunks:', totalChunks,
            '\nbytes:', totalBytes,
            '\nworkers:', nextWorker,
            '\nbytes/chunk:', totalBytes / totalChunks,
            '\nchunks/worker:', totalChunks / nextWorker
        );
    }
}

export default mainWorker;
