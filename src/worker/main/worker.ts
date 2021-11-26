import { parseLine } from '../../helper/parseLine';
import { PerfMon } from '../../helper/perfMon';
import { splitLine } from '../../helper/splitLine';
import { storeValue } from '../../helper/storeValue';
import { Chunk } from '../../types/chunk/chunk';
import * as SubInterface from '../sub/interface';
import * as MainInterface from './interface';

const mainWorker: Worker = self as unknown as Worker;

let setup: MainInterface.SetupData;
const chunks = new Array<ArrayBufferLike>();
const targetNumWorkers = 25;
let chunksPerWorker: number;
let totalBytes = 0;
let totalChunks = 0;
let nextWorker = 0;
let allChunksHandled = false;
const perfMon = new PerfMon();

const runningWorkers = new Map<number, Worker>();
const parsedChunks = new Map<number, Chunk[]>();
const generatedChunks = new Map<number, Chunk[]>();
const startRemainders = new Map<number, SharedArrayBuffer>();
const endRemainders = new Map<number, SharedArrayBuffer>();
let nextChunkToBeFinished = 0;
let chunkLengthSum = 0;

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
            if (setup.options.verbose)
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

    const subWorker = new Worker(
        // @ts-expect-error The path to the worker source is only during build.
        new URL(__SUB_WORKER_SOURCE, import.meta.url),
        { type: 'module' }
    );

    subWorker.onmessage = (e: MessageEvent<SubInterface.MessageData>) => {
        const msg = e.data;
        if (e.data.type !== SubInterface.MessageType.Finished && setup.options.verbose) {
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
            includesHeader: setup.options.includesHeader && workerId === 0,
        },
    };

    const msg: SubInterface.MessageData = {
        type: SubInterface.MessageType.Start,
        data,
    };

    const label = `worker ${workerId}`;
    if (setup.options.verbose) console.log('starting ' + label);
    runningWorkers.set(workerId, subWorker);
    perfMon.start(workerId, label);
    subWorker.postMessage(msg, [...workerChunks]);
}

function onSubWorkerFinished(data: SubInterface.FinishedData, workerId: number): void {
    perfMon.stop(workerId);
    if (setup.options.verbose) console.log(`worker ${workerId} done`);
    const subWorker = runningWorkers.get(workerId);
    runningWorkers.delete(workerId);

    parsedChunks.set(workerId, data.chunks);
    generatedChunks.set(workerId, data.generatedChunks);
    startRemainders.set(workerId, data.startRemainder);
    endRemainders.set(workerId, data.endRemainder);

    let success = false;
    do {
        success = finishChunk();
    } while (success);

    if (allChunksHandled && runningWorkers.size === 0) done();
    subWorker.terminate();
}

function finishChunk(): boolean {
    const pc = parsedChunks.get(nextChunkToBeFinished);
    const gc = generatedChunks.get(nextChunkToBeFinished);
    const er = endRemainders.get(nextChunkToBeFinished);
    const sr = startRemainders.get(nextChunkToBeFinished + 1);
    const lastChunk = allChunksHandled && nextWorker === nextChunkToBeFinished + 1;

    const ready = pc && gc && er && (sr || lastChunk);
    if (!ready) return false;

    const buf = new Uint8Array(er.byteLength + (sr?.byteLength ?? 0));
    buf.set(new Uint8Array(er));
    if (sr) buf.set(new Uint8Array(sr), er.byteLength);

    handleRemainder(buf, pc, gc);
    pc.forEach(c => (c.offset = chunkLengthSum));
    gc.forEach(c => (c.offset = chunkLengthSum));
    chunkLengthSum += pc[0].length;

    parsedChunks.delete(nextChunkToBeFinished);
    generatedChunks.delete(nextChunkToBeFinished);
    endRemainders.delete(nextChunkToBeFinished);
    startRemainders.delete(nextChunkToBeFinished + 1);

    const data: MainInterface.ProcessedData = {
        chunks: [...pc, ...gc],
    };
    const msg: MainInterface.MessageData = {
        type: MainInterface.MessageType.Processed,
        data,
    };
    postMessage(msg);

    nextChunkToBeFinished++;

    return true;
}

function handleRemainder(buf: Uint8Array, pc: Chunk[], gc: Chunk[]): void {
    const text = new TextDecoder().decode(buf);
    const valueTexts = splitLine(text, setup.options.delimiter);
    const values = parseLine(valueTexts, setup.columns);
    values.forEach((v, vi) => storeValue(v, pc[vi].length - 1, pc[vi]));

    const gen = setup.generatedColumns;
    const genValues = gen.map(g => g.func(valueTexts, values));
    genValues.forEach((v, vi) => storeValue(v, gc[vi].length - 1, gc[vi]));
}

function done(): void {
    const data: MainInterface.FinishedData = {
        chunks: totalChunks,
        bytes: totalBytes,
        workers: nextWorker,
        performance: perfMon.samples,
    };
    const msg: MainInterface.MessageData = {
        type: MainInterface.MessageType.Finished,
        data,
    };
    postMessage(msg);
}

export default mainWorker;
