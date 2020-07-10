import { getBitmapValue } from "./util";

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L556-L622
 */
export function findMapPages(buffer: Buffer): number[] {
    switch (buffer[0]) {
        case 0x00:
            return findMapPages0(buffer);
        case 0x01:
            return findMapPages1(buffer);
        default:
            throw new Error("Unknown usage map type");
    }
}

function findMapPages0(buffer: Buffer): number[] {
    const pageStart = buffer.readUInt32LE(1);

    const pages: number[] = [];

    const bitmap = buffer.slice(5);
    for (let i = 0; i < bitmap.length * 8; i++) {
        if (getBitmapValue(bitmap, i)) {
            pages.push(pageStart + i);
        }
    }

    return pages;
}

function findMapPages1(buffer: Buffer): number[] {
    throw new Error("Not implemented yet");
}
