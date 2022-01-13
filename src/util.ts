/**
 * Reads a specific bit of a bitmap. Returns true for 1 and false for 0.
 *
 * @param pos 0-based
 */
export function getBitmapValue(bitmap: Buffer, pos: number): boolean {
    const byteNumber = Math.floor(pos / 8);
    const bitNumber = pos % 8;
    return !!(bitmap[byteNumber] & (1 << bitNumber));
}

/**
 * Returns the number of bytes required to store a specific number of bits.
 */
export function roundToFullByte(bits: number): number {
    return Math.floor((bits + 7) / 8);
}

/**
 * @see https://github.com/crypto-browserify/buffer-xor
 */
export function xor(a: Buffer, b: Buffer) {
    const length = Math.max(a.length, b.length);
    const buffer = Buffer.allocUnsafe(length);

    for (let i = 0; i < length; i++) {
        buffer[i] = a[i] ^ b[i];
    }

    return buffer;
}

/**
 * Returns true if buffer only contains zeros.
 */
export function isEmptyBuffer(buffer: Buffer): boolean {
    return buffer.every((v) => v === 0);
}

export function intToBuffer(n: number): Buffer {
    const buffer = Buffer.allocUnsafe(4);
    buffer.writeInt32LE(n);
    return buffer;
}

export function fixBufferLength(buffer: Buffer, length: number, padByte = 0): Buffer {
    if (buffer.length > length) {
        return buffer.slice(0, length);
    }

    if (buffer.length < length) {
        return Buffer.from(buffer).fill(padByte, buffer.length, length);
    }

    return buffer;
}

export function isInRange(from: number, to: number, value: number): boolean {
    return from <= value && value <= to;
}
