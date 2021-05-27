export function splitLine(line: string, delimiter: string): Array<string> {
    const cells = new Array<string>();

    let start = 0;
    let quote = false;
    let quoteActive = false;

    const push = (end: number): void => {
        cells.push(line.substring(
            quote ? start + 1 : start,
            quote ? end - 1 : end));
    };

    for (let i = 0; i < line.length; i++) {
        const char = line.charAt(i);
        if (char === '"') {
            quoteActive = !quoteActive;
            quote = true;
            continue;
        }
        if (quoteActive) {
            continue;
        }
        const { end, skip } = cellEnd(line, i, delimiter);
        if (end) {
            push(i);
            start = i + skip;
            quote = false;
        }
    }
    push(undefined);

    return cells;
}

function cellEnd(line: string, index: number, delimiter: string): {
    end: boolean, skip: number
} {
    const char = line.charAt(index);
    switch (char) {
        case delimiter:
        case '\n':
            return { end: true, skip: 1 };
        case '\r':
            if (line.charAt(index + 1) === '\n') {
                return { end: true, skip: 2 };
            }
        // eslint-disable-next-line no-fallthrough
        default:
            return { end: false, skip: 0 };
    }
}
