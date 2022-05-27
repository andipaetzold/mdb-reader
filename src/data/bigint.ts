export function readBigInt(buffer: Buffer): bigint {
    return buffer.readBigInt64LE();
}