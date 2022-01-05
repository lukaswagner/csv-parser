class CsvTransformer {
    protected _isInValues = false;
    protected _isInRow = false;
    protected _resultChunk = '';

    public start(): void {}
    public flush(): void {}

    public transform: TransformerTransformCallback<string, string> = (chunk, controller) => {
        const searchString = `"values": [`;
        const rows = chunk.split('\n');
        let start = 0;

        if (!this._isInValues) {
            if (chunk.includes(searchString)) {
                this._isInValues = true;
                start = rows.findIndex((row) => row.trim() === searchString) + 1;
            } else {
                return;
            }
        }

        for (const row of rows.slice(start)) {
            const value = row.trim();

            switch (value) {
                case '[':
                    this._isInRow = true;
                    break;

                case '],':
                case ']':
                    if (!this._isInRow) {
                        controller.enqueue(this._resultChunk);
                        controller.terminate();
                        return;
                    }

                    this._resultChunk += '\n';
                    this._isInRow = false;
                    break;

                default:
                    this._resultChunk += value.replace(/"/g, '');
                    break;
            }
        }

        controller.enqueue(this._resultChunk);
        this._resultChunk = '';
    };
}

/**
 * Gets the spreadsheet application specific name of a column from a number.
 *
 * Inspired by https://stackoverflow.com/questions/181596/how-to-convert-a-column-number-e-g-127-into-an-excel-column-e-g-aa.
 *
 * @param columnCount - Numeric representation of a column.
 * @returns Application specific column name.
 */
function calculateEndColumn(columnCount: number): string {
    const A = 'A'.charCodeAt(0);
    let columnName = '';

    while (columnCount > 0) {
        const mod = (columnCount - 1) % 26;

        columnName = String.fromCharCode(A + mod) + columnName;
        columnCount = Math.trunc((columnCount - mod) / 26);
    }

    return columnName;
}

function fetchSheetData(route: string): Promise<Response> {
    return fetch(`https://sheets.googleapis.com/v4/spreadsheets${route}`);
}

export async function fetchSheetDataRange(sheetId: string, apiKey: string): Promise<string> {
    const route = `/${sheetId}?key=${apiKey}`;
    const response = await fetchSheetData(route);
    const { sheets } = await response.json();
    const {
        title,
        gridProperties: { rowCount, columnCount },
    } = sheets[0].properties;
    const range = `${title}!A1:${calculateEndColumn(columnCount)}${rowCount}`;

    return range;
}

export async function fetchSheetValues(
    sheetId: string,
    apiKey: string,
    range: string
): Promise<ReadableStream<Uint8Array>> {
    const route = `/${sheetId}/values/${range}?key=${apiKey}`;
    const response = await fetchSheetData(route);
    const stream = response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new TransformStream(new CsvTransformer()))
        .pipeThrough(new TextEncoderStream());

    return stream;
}
