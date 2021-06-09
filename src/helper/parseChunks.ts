import { Position } from './position';
import { splitLines } from './splitLines';

export function parse(
    chunks: ArrayBufferLike[], start: Position, end: Position
): string[] {
    if (start.chunk === end.chunk) {
        return parseSingleChunk(chunks[start.chunk], start, end);
    }

    return parseMultipleChunks(chunks, start, end);
}

function parseSingleChunk(
    chunk: ArrayBufferLike, start: Position, end: Position
): string[] {
    const decoder = new TextDecoder();
    const lines = new Array<string>();
    const buffer = new Uint8Array(chunk, start.char, end.char - start.char);
    splitLines(decoder.decode(buffer), lines);
    return lines;
}

function parseMultipleChunks(
    chunks: ArrayBufferLike[], start: Position, end: Position
): string[] {
    const decoder = new TextDecoder();
    const expectMore = { stream: true };
    const lines = new Array<string>();
    let remainder = '';

    // first chunk
    const first = new Uint8Array(chunks[start.chunk], start.char);
    remainder = splitLines(decoder.decode(first, expectMore), lines, remainder);

    // second to second-to-last chunks
    for (let i = start.chunk + 1; i < end.chunk; i++) {
        remainder = splitLines(
            decoder.decode(chunks[i], expectMore), lines, remainder);
    }

    // last chunk
    const last = new Uint8Array(chunks[end.chunk], 0, end.char);
    remainder = splitLines(decoder.decode(last), lines, remainder);

    // last chunk does not end with newline
    lines.push(remainder);

    return lines;
}
