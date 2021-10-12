export function readBinary(buffer: Buffer): Buffer {
    const result = Buffer.alloc(buffer.length);
    buffer.copy(result);
    return result;
}
