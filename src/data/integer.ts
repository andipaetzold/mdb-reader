export function readInteger(buffer: Buffer): number {
    return buffer.readInt16LE(0);
}
