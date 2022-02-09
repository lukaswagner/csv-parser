class ExcelCsvTransformer {
    protected _isInValues = false;
    protected _isInRow = false;
    protected _resultChunk = '';

    public start(): void {}
    public flush(): void {}

    public transform: TransformerTransformCallback<string, string> = (chunk, controller) => {
        const searchString = `"text":[`;
        let start = 0;

        if (!this._isInValues) {
            const searchIndex = chunk.indexOf(searchString);

            if (searchIndex >= 0) {
                this._isInValues = true;
                start = searchIndex + searchString.length;
            } else {
                return;
            }
        }

        for (const char of chunk.substring(start)) {
            switch (char) {
                case '[':
                    this._isInRow = true;
                    break;

                case ']':
                    if (!this._isInRow) {
                        controller.enqueue(this._resultChunk);
                        controller.terminate();
                        return;
                    }

                    this._resultChunk += '\n';
                    this._isInRow = false;
                    break;

                case '"':
                    // Ignore string quotes
                    break;

                case ',':
                    if (!this._isInRow) {
                        // Ignore comma between rows
                        break;
                    }

                // fallthrough

                default:
                    this._resultChunk += char;
                    break;
            }
        }

        controller.enqueue(this._resultChunk);
        this._resultChunk = '';
    };
}

function fetchSheetData(route: string, apiToken: string): Promise<Response> {
    const headers = new Headers();

    headers.set('Authorization', `Bearer ${apiToken}`);

    return fetch(`https://graph.microsoft.com/v1.0/me/drive/items${route}`, { headers });
}

export async function fetchSheetDataRange(sheetId: string, apiToken: string): Promise<string> {
    const route = `/${sheetId}/workbook/worksheets`;
    const response = await fetchSheetData(route, apiToken);
    const { value: sheets } = await response.json();
    const { name } = sheets[0];

    return name;
}

export async function fetchSheetValues(
    sheetId: string,
    apiToken: string,
    tableName: string
): Promise<ReadableStream<Uint8Array>> {
    const route = `/${sheetId}/workbook/worksheets('${tableName}')/usedRange?$select=text`;
    const response = await fetchSheetData(route, apiToken);
    const stream = response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new TransformStream(new ExcelCsvTransformer()))
        .pipeThrough(new TextEncoderStream());

    return stream;
}
