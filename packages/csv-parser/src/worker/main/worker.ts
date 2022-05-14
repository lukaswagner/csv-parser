import { parseLine } from '../../helper/parseLine';
import { PerfMon } from '../../helper/perfMon';
import { splitLine } from '../../helper/splitLine';
import { storeValue } from '../../helper/storeValue';
import { Chunk, rebuildChunk, AnyChunk } from '../../types/chunk/chunk';
import * as SubInterface from '../sub/interface';
import * as MainInterface from './interface';

const mainWorker: Worker = self as unknown as Worker;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function postMessage(message: any, transfer?: Transferable[]): void;
}

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
const startRemainders = new Map<number, ArrayBufferLike>();
const endRemainders = new Map<number, ArrayBufferLike>();
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
    allChunksHandled = true;
    startSubWorker();
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

    const subWorker = new Worker(new URL('../sub/worker.ts', import.meta.url), { type: 'module' });

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
        lastChunk: allChunksHandled,
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

    parsedChunks.set(
        workerId,
        data.chunks.map((c) => rebuildChunk(c, setup.options.sharedArrayBuffer))
    );
    generatedChunks.set(
        workerId,
        data.generatedChunks.map((c) => rebuildChunk(c, setup.options.sharedArrayBuffer))
    );
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
    const parsed = parsedChunks.get(nextChunkToBeFinished);
    const generated = generatedChunks.get(nextChunkToBeFinished);
    const end = endRemainders.get(nextChunkToBeFinished);
    const start = startRemainders.get(nextChunkToBeFinished + 1);
    const lastChunk = allChunksHandled && nextWorker === nextChunkToBeFinished + 1;

    // all data mus be present except for the last chunk, where no next chunk can provide a start
    const ready = parsed && generated && end && (start || lastChunk);
    if (!ready) return false;

    if (!lastChunk) {
        const buf = new Uint8Array(end.byteLength + (start?.byteLength ?? 0));
        buf.set(new Uint8Array(end));
        buf.set(new Uint8Array(start), end.byteLength);

        handleRemainder(buf, parsed, generated);
    }
    parsed.forEach((chunk) => (chunk.offset = chunkLengthSum));
    generated.forEach((chunk) => (chunk.offset = chunkLengthSum));
    chunkLengthSum += parsed[0].length;

    parsedChunks.delete(nextChunkToBeFinished);
    generatedChunks.delete(nextChunkToBeFinished);
    endRemainders.delete(nextChunkToBeFinished);
    startRemainders.delete(nextChunkToBeFinished + 1);

    const data: MainInterface.ProcessedData = {
        chunks: [...parsed, ...generated],
    };
    const msg: MainInterface.MessageData = {
        type: MainInterface.MessageType.Processed,
        data,
    };
    const transf = setup.options.sharedArrayBuffer ? data.chunks.map((c: AnyChunk) => c.data) : [];
    postMessage(msg, transf);

    nextChunkToBeFinished++;

    return true;
}

function handleRemainder(buf: Uint8Array, parsed: Chunk[], generated: Chunk[]): void {
    const text = new TextDecoder().decode(buf);
    const valueTexts = splitLine(text, setup.options.delimiter);
    const values = parseLine(valueTexts, setup.columns);
    values.forEach((value, column) => storeValue(value, parsed[column].length - 1, parsed[column]));

    const gen = setup.generatedColumns;
    const genValues = gen.map((g) => g.func(valueTexts, values));
    genValues.forEach((value, column) =>
        storeValue(value, generated[column].length - 1, generated[column])
    );
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
