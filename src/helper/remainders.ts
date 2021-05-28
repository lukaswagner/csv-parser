import { findLastIndex } from './findLastIndex';
import { Position } from './position';

type RemainderInfo = {
    startRemainder: Uint8Array, start: Position,
    endRemainder: Uint8Array, end: Position
}

function detectRemainders(chunks: ArrayBuffer[]): RemainderInfo {
    const lf = 0x0A;
    const cr = 0x0D;

    const start: Position = { chunk: 0, char: 0 };
    const end: Position = { chunk: 0, char: 0 };

    let startRemainder: Uint8Array;
    let endRemainder: Uint8Array;

    let done = false;
    let remainderLength = 0;

    // find first lf -> everything before is remainder
    for (let i = 0; i < chunks.length; i++) {
        const chunk = new Uint8Array(chunks[i]);
        const lfPos = chunk.findIndex((c) => c === lf);

        // no lf -> whole chunk is remainder
        if (!lfPos) {
            remainderLength += chunk.length;
            continue;
        }

        // lf found -> store start position
        if (lfPos < chunk.length - 1) {
            start.chunk = i;
            start.char = lfPos + 1;
        } else {
            start.chunk = i + 1;
            start.char = 0;
        }

        // prepare buffer for start remainder
        const crFix = chunk[lfPos - 1] === cr ? -1 : 0;
        startRemainder = new Uint8Array(remainderLength + lfPos + crFix);
        break;
    }

    let remainderIndex = 0;
    remainderLength = startRemainder.length;
    // fill in start remainder from previous chunks
    for (let i = 0; i <= start.chunk; i++) {
        let chunk = new Uint8Array(chunks[i]);
        if (chunk.length > remainderLength - remainderIndex - 1) {
            chunk = chunk.subarray(0, remainderLength - remainderIndex);
        }
        startRemainder.set(chunk, remainderIndex);
        remainderIndex += chunk.length;
    }

    done = false;
    remainderLength = 0;
    // find last lf -> everything after is remainder
    for (let i = chunks.length - 1; i >= 0; i--) {
        const chunk = new Uint8Array(chunks[i]);
        const lfPos = findLastIndex(chunk, (c) => c === lf);

        // no lf -> whole chunk is remainder
        if (!lfPos) {
            remainderLength += chunk.length;
            continue;
        }

        // lf found -> store end position
        end.chunk = i;
        end.char = lfPos;

        // prepare buffer for start remainder
        startRemainder = new Uint8Array(
            remainderLength + chunk.length - 1 - lfPos);
        break;
    }

    done = false;
    remainderIndex = endRemainder.length - 1;
    remainderLength = endRemainder.length;
    // fill in end remainder from following chunks
    for (let i = chunks.length - 1; i >= end.chunk; i--) {

        let chunk = new Uint8Array(chunks[i]);
        if (chunk.length > remainderIndex) {
            chunk = chunk.subarray(chunk.length - remainderIndex - 1);
        }
        endRemainder.set(chunk, remainderIndex - chunk.length + 1);
        remainderIndex -= chunk.length;
    }

    return { startRemainder, start, endRemainder, end };
}
