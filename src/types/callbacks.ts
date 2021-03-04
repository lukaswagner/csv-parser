import { Column } from "./column/column";

export type UpdateCallback = (progress: Number) => void;
export type ResolveCallback = (data: Column[]) => void;
export type RejectCallback = (reason?: any) => void;
