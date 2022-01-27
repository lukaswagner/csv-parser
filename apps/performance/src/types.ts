export type ImmediateResult = {
    rows: number;
    error?: string;
};

export type LoadFunc = () => Promise<ImmediateResult>;

export type Result = {
    time: number;
    rows: number;
    error?: string;
    userAgent: string;
};
