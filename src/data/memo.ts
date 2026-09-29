import type { Column } from "../index.js";
import { Database } from "../Database.js";
import { uncompressText } from "../unicodeCompression.js";

const TYPE_THIS_PAGE = 0x80;
const TYPE_OTHER_PAGE = 0x40;
const TYPE_OTHER_PAGES = 0x00;

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L690-L776
 */
export function readMemo(buffer: Buffer, _col: Column, database: Database): string {
    if (buffer.length < 4) {
        return "";
    }

    const memoLength = buffer.readUIntLE(0, 3);
    const type = buffer.readUInt8(3);

    switch (type) {
        case TYPE_THIS_PAGE: {
            if (buffer.length < 12) {
                return "";
            }
            const compressedText = buffer.slice(12, Math.min(buffer.length, 12 + memoLength));
            return uncompressText(compressedText, database.format);
        }

        case TYPE_OTHER_PAGE: {
            if (buffer.length < 8) {
                return "";
            }
            const pageRow = buffer.readUInt32LE(4);
            const rowBuffer = database.findPageRow(pageRow);
            if (rowBuffer.length === 0) {
                return "";
            }
            const compressedText = rowBuffer.slice(0, Math.min(rowBuffer.length, memoLength));
            return uncompressText(compressedText, database.format);
        }

        case TYPE_OTHER_PAGES: {
            if (buffer.length < 8) {
                return "";
            }
            let pageRow = buffer.readInt32LE(4);
            let memoDataBuffer = Buffer.alloc(0);
            do {
                const rowBuffer = database.findPageRow(pageRow);

                if (rowBuffer.length <= 4) {
                    break;
                }

                if (memoDataBuffer.length + rowBuffer.length - 4 > memoLength) {
                    break;
                }

                memoDataBuffer = Buffer.concat([memoDataBuffer, rowBuffer.slice(4)]);

                pageRow = rowBuffer.readInt32LE(0);
            } while (pageRow !== 0);

            if (memoDataBuffer.length === 0) {
                return "";
            }

            const compressedText = memoDataBuffer.slice(0, Math.min(memoDataBuffer.length, memoLength));
            return uncompressText(compressedText, database.format);
        }
        default:
            throw new Error(`Unknown memo type ${type}`);
    }
}
