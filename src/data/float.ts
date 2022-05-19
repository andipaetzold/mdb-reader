export function readFloat(buffer: Buffer): number {
    return buffer.readFloatLE(0);
}
