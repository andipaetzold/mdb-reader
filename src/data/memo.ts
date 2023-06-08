import { Column } from "../index.js";
import Database from "../Database.js";
import { uncompressText } from "../unicodeCompression.js";

const TYPE_THIS_PAGE = 0x80;
const TYPE_OTHER_PAGE = 0x40;
const TYPE_OTHER_PAGES = 0x00;

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L690-L776
 */
export function readMemo(buffer: Buffer, _col: Column, db: Database): string {
    const memoLength = buffer.readUIntLE(0, 3);

    const type = buffer.readUInt8(3);
    switch (type) {
        case TYPE_THIS_PAGE: {
            return uncompressText(buffer.slice(12, 12 + memoLength), db.format);
        }

        case TYPE_OTHER_PAGE: {
            const pageRow = buffer.readUInt32LE(4);
            const rowBuffer = db.findPageRow(pageRow);
            return uncompressText(rowBuffer.slice(0, memoLength), db.format);
        }

        case TYPE_OTHER_PAGES: {
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

                memoDataBuffer = Buffer.concat([memoDataBuffer, rowBuffer.slice(4)]);

                pageRow = rowBuffer.readInt32LE(0);
            } while (pageRow !== 0);

            return uncompressText(memoDataBuffer.slice(0, memoLength), db.format);
        }
        default:
            throw new Error(`Unknown memo type ${type}`);
    }
}
