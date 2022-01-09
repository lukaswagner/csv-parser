import { parse } from '../../helper/parseChunks';
import { parseLine } from '../../helper/parseLine';
import { detectRemainders, RemainderInfo } from '../../helper/remainders';
import { splitLine } from '../../helper/splitLine';
import { storeValue } from '../../helper/storeValue';
import { buildChunk, Chunk } from '../../types/chunk/chunk';
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
    const remainders = detectRemainders(data.chunks);
    const lines = parse(data.chunks, remainders.start, remainders.end).map((l) =>
        splitLine(l, data.options.delimiter)
    );

    const numChunks = lines.length + 1; // +1 for inter-chunk remainder
    const chunks = data.columns.map((c) => buildChunk(c, numChunks));
    const values = lines.map((l) => parseLine(l, data.columns));
    values.forEach((line, li) => line.forEach((value, vi) => storeValue(value, li, chunks[vi])));

    const gen = data.generatedColumns;
    const generatedChunks = gen.map((c) => buildChunk(c.type, numChunks));

    lines.forEach((line, li) => {
        const genValues = gen.map((g) => g.func(line, values[li]));
        genValues.forEach((value, vi) => storeValue(value, li, generatedChunks[vi]));
    });

    sendFinished(chunks, generatedChunks, remainders);
}

function sendFinished(
    chunks: Array<Chunk>,
    generatedChunks: Array<Chunk>,
    rem: RemainderInfo
): void {
    const data: Interface.FinishedData = {
        chunks,
        generatedChunks,
        startRemainder: rem.startRemainder,
        endRemainder: rem.endRemainder,
    };

    const msg: Interface.MessageData = {
        type: Interface.MessageType.Finished,
        data,
    };

    postMessage(msg);
}

export default subWorker;
