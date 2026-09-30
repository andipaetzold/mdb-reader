import type { Column } from "../column.js";
import { Database } from "../Database.js";

const TYPES = {
    THIS_PAGE: 0x80,
    OTHER_PAGE: 0x40,
    OTHER_PAGES: 0x00,
} as const;

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L626-L688
 * @see https://github.com/spannm/jackcess/blob/4c433a4ae4969ff5658556806a35ccb13cc35313/src/main/java/io/github/spannm/jackcess/impl/LongValueColumnImpl.java#L130-L209
 */
export function readOLE(
    buffer: Buffer,
    _col: Column,
    database: Database,
    options?: { ignoreCorruptValues?: boolean | undefined } | undefined,
): Buffer {
    if (buffer.length < 4) {
        if (options?.ignoreCorruptValues) {
            return Buffer.alloc(0);
        }
        throw new Error("Invalid OLE buffer header");
    }

    const length = buffer.readUIntLE(0, 3);
    const type = buffer.readUInt8(3);

    switch (type) {
        case TYPES.THIS_PAGE: {
            // 0-2: Length
            // 3: Type
            // 4-7: lval_dp
            // 8-11: unknown
            // 12: data

            // inline
            if (buffer.length < 12) {
                if (options?.ignoreCorruptValues) {
                    return Buffer.alloc(0);
                }
                throw new Error("Invalid OLE inline buffer");
            }
            return buffer.slice(12, 12 + length);
        }
        case TYPES.OTHER_PAGE: {
            // single page
            if (buffer.length < 8) {
                if (options?.ignoreCorruptValues) {
                    return Buffer.alloc(0);
                }
                throw new Error("Invalid OLE pointer buffer");
            }
            const pageRow = buffer.readUInt32LE(4);
            let rowBuffer: Buffer;
            try {
                rowBuffer = database.findPageRow(pageRow);
            } catch (err) {
                if (options?.ignoreCorruptValues) {
                    return Buffer.alloc(0);
                }
                throw err;
            }
            if (rowBuffer.length < length) {
                if (options?.ignoreCorruptValues) {
                    return rowBuffer.slice(0, Math.min(rowBuffer.length, length));
                }
                throw new Error("Corrupted OLE page row buffer");
            }
            return rowBuffer.slice(0, length);
        }
        case TYPES.OTHER_PAGES: {
            // multi page
            if (buffer.length < 8) {
                if (options?.ignoreCorruptValues) {
                    return Buffer.alloc(0);
                }
                throw new Error("Invalid OLE multi-page pointer buffer");
            }
            let pageRow = buffer.readInt32LE(4);
            
            const result = Buffer.alloc(length);
            
            let offset = 0;
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
                    throw new Error("Corrupted OLE chain row");
                }

                pageRow = rowBuffer.readUInt32LE(0);

                const newChunk = rowBuffer.subarray(4);
                newChunk.copy(result, offset);
                offset += newChunk.length;
            } while (pageRow !== 0);

            return result.subarray(0, length);
        }
        default: {
            throw new Error(`Unknown OLE type ${type}`);
        }
    }
}
