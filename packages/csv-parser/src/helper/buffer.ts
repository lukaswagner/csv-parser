export function buffer(length: number, shared: boolean): ArrayBufferLike {
    if (shared) return new SharedArrayBuffer(length);
    else return new ArrayBuffer(length);
}
