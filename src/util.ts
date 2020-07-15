import BufferCursor from "./BufferCursor";

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

export function readNextString(
    cursor: BufferCursor,
    lengthSize: number
): string {
    let length: number;
    switch (lengthSize) {
        case 1:
            length = cursor.readUInt8();
            break;
        case 2:
            length = cursor.readUInt16LE();
            break;
        default:
            throw new Error(`Length Size ${lengthSize} is not supported`);
    }

    return cursor.readString(length);
}
