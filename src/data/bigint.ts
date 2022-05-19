export function readBigInt(buffer: Buffer): BigInt {
    return buffer.readBigInt64LE(0);
}
