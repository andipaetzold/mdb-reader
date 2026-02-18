export function readComplex(buffer: Buffer): number {
    return buffer.readInt32LE(0);
}
