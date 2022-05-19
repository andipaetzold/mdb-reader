export function readComplexOrLong(buffer: Buffer): number {
    return buffer.readInt32LE(0);
}
