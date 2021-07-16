export type Measurement = {
    start: number,
    end: number,
    delta: number,
    label: string,
}

export class PerfMon {
    protected _samples = new Map<number, Measurement>();

    public start(id: number, label: string): void {
        if(this._samples.has(id)) {
            console.warn('performance measurement already exists');
            return;
        }
        this._samples.set(id, {
            start: Date.now(),
            end: 0,
            delta: 0,
            label
        });
    }

    public stop(id: number): void {
        if(!this._samples.has(id)) {
            console.warn('performance measurement doesn\'t exist');
            return;
        }
        const sample = this._samples.get(id);
        sample.end = Date.now();
        sample.delta = sample.end - sample.start;
    }

    public get samples(): Measurement[] {
        return [...this._samples.values()];
    }
}
