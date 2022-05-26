import { Column } from "../index.js";
import Database from "../Database.js";
import { uncompressText } from "../unicodeCompression.js";

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L690-L776
 */
export function readMemo(buffer: Buffer, _col: Column, db: Database): string {
    const memoLength = buffer.readUIntLE(0, 3);

    const bitmask = buffer.readUInt8(3);
    if (bitmask & 0x80) {
        // inline
        return uncompressText(buffer.slice(12, 12 + memoLength), db.format);
    } else if (bitmask & 0x40) {
        // single page
        const pageRow = buffer.readUInt32LE(4);
        const rowBuffer = db.findPageRow(pageRow);
        return uncompressText(rowBuffer.slice(0, memoLength), db.format);
    } else if (bitmask === 0) {
        // multi page
        let pageRow = buffer.readInt32LE(4);
        let memoDataBuffer = Buffer.alloc(0);
        do {
            const rowBuffer = db.findPageRow(pageRow);

            if (memoDataBuffer.length + rowBuffer.length - 4 > memoLength) {
                break;
            }

            if (rowBuffer.length === 0) {
                break;
            }

            memoDataBuffer = Buffer.concat([memoDataBuffer, rowBuffer.slice(4, buffer.length)]);

            pageRow = rowBuffer.readInt32LE(0);
        } while (pageRow !== 0);

        return uncompressText(memoDataBuffer.slice(0, memoLength), db.format);
    } else {
        throw new Error(`Unknown memo type ${bitmask}`);
    }
}
