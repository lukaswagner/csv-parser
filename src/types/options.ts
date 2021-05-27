export class CsvLoaderOptions {
    public delimiter?: string;
    public includesHeader = true;
    public size?: number;
    public typeInferLines = 20;

    public constructor(obj?: unknown) {
        Object.assign(this, obj);
    }
}
