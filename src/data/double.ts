export function readDouble(buffer: Buffer): number {
    return buffer.readDoubleLE(0);
}
