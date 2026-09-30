import type { Column } from "../index.js";
import { Database } from "../Database.js";
import { uncompressText } from "../unicodeCompression.js";

const TYPE_THIS_PAGE = 0x80;
const TYPE_OTHER_PAGE = 0x40;
const TYPE_OTHER_PAGES = 0x00;

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L690-L776
 */
export function readMemo(
    buffer: Buffer,
    _col: Column,
    database: Database,
    options?: { ignoreCorruptValues?: boolean | undefined } | undefined,
): string {
    if (buffer.length < 4) {
        if (options?.ignoreCorruptValues) {
            return "";
        }
        throw new Error("Invalid memo buffer header");
    }

    const memoLength = buffer.readUIntLE(0, 3);
    const type = buffer.readUInt8(3);

    switch (type) {
        case TYPE_THIS_PAGE: {
            if (buffer.length < 12) {
                if (options?.ignoreCorruptValues) {
                    return "";
                }
                throw new Error("Invalid memo inline buffer");
            }
            const compressedText = buffer.slice(12, 12 + memoLength);
            return uncompressText(compressedText, database.format);
        }

        case TYPE_OTHER_PAGE: {
            if (buffer.length < 8) {
                if (options?.ignoreCorruptValues) {
                    return "";
                }
                throw new Error("Invalid memo pointer buffer");
            }
            const pageRow = buffer.readUInt32LE(4);
            let rowBuffer: Buffer;
            try {
                rowBuffer = database.findPageRow(pageRow);
            } catch (err) {
                if (options?.ignoreCorruptValues) {
                    return "";
                }
                throw err;
            }
            if (rowBuffer.length < memoLength) {
                if (options?.ignoreCorruptValues) {
                    const compressedText = rowBuffer.slice(0, Math.min(rowBuffer.length, memoLength));
                    return uncompressText(compressedText, database.format);
                }
                throw new Error("Corrupted memo page row buffer");
            }
            const compressedText = rowBuffer.slice(0, memoLength);
            return uncompressText(compressedText, database.format);
        }

        case TYPE_OTHER_PAGES: {
            if (buffer.length < 8) {
                if (options?.ignoreCorruptValues) {
                    return "";
                }
                throw new Error("Invalid memo multi-page pointer buffer");
            }
            let pageRow = buffer.readInt32LE(4);
            let memoDataBuffer = Buffer.alloc(0);
            do {
                let rowBuffer: Buffer;
                try {
                    rowBuffer = database.findPageRow(pageRow);
                } catch (err) {
                    if (options?.ignoreCorruptValues) {
                        break;
                    }
                    throw err;
                }

                if (rowBuffer.length <= 4) {
                    if (options?.ignoreCorruptValues) {
                        break;
                    }
                    throw new Error("Corrupted memo chain row");
                }

                if (memoDataBuffer.length + rowBuffer.length - 4 > memoLength) {
                    break;
                }

                memoDataBuffer = Buffer.concat([memoDataBuffer, rowBuffer.slice(4)]);
                pageRow = rowBuffer.readInt32LE(0);
            } while (pageRow !== 0);

            const compressedText = memoDataBuffer.slice(0, memoLength);
            return uncompressText(compressedText, database.format);
        }
        default:
            throw new Error(`Unknown memo type ${type}`);
    }
}
