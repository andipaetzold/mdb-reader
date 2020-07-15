import { ColumnDefinition } from "./column";
import { Constants } from "./constants";
import { readNumeric, readCurrency } from "./money";
import { uncompressText } from "./unicodeCompression";
import Database from "./Database";

export type Value = number | string | Buffer | Date | boolean | null;

export function readFieldValue(
    buffer: Buffer,
    column: ColumnDefinition,
    db: Database
): Exclude<Value, boolean | null> {
    if (column.type === "boolean") {
        throw new Error("readFieldValue does not handle type boolean");
    }

    switch (column.type) {
        case "byte":
            return readByte(buffer);
        case "integer":
            return readInteger(buffer);
        case "complex":
        case "long":
            return readComplexOrLong(buffer);
        case "float":
            return readFloat(buffer);
        case "double":
            return readDouble(buffer);
        case "binary":
            return readBinary(buffer);
        case "text":
            return readText(buffer, db.constants);
        case "repid":
            return readRepID(buffer);
        case "datetime":
            return readDateTime(buffer);
        case "numeric":
            return readNumeric(buffer, column.precision!, column.scale!);
        case "currency":
            return readCurrency(buffer);
        case "memo":
            return readMemo(buffer, db);
        default:
            return `Column type ${column.type} is currently not supported`;
    }
}

function readByte(buffer: Buffer): number {
    return buffer.readInt8();
}

function readInteger(buffer: Buffer): number {
    return buffer.readInt16LE();
}

function readComplexOrLong(buffer: Buffer): number {
    return buffer.readInt32LE();
}

function readFloat(buffer: Buffer): number {
    return buffer.readFloatLE();
}

function readDouble(buffer: Buffer): number {
    return buffer.readDoubleLE();
}

function readBinary(buffer: Buffer): Buffer {
    const result = Buffer.alloc(buffer.length);
    buffer.copy(result);
    return result;
}

function readText(
    buffer: Buffer,
    constants: Pick<Constants, "format">
): string {
    return uncompressText(buffer, constants.format);
}

function readRepID(buffer: Buffer): string {
    const str = buffer.toString("hex");
    return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(
        12,
        16
    )}-${str.slice(16, 20)}-${str.slice(20)}`;
}

function readDateTime(buffer: Buffer): Date {
    const td = buffer.readDoubleLE();
    const daysDiff = 25569; // days between 1899-12-30 and 01-01-19070
    return new Date((td - daysDiff) * 86400 * 1000);
}

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L690-L776
 */
function readMemo(buffer: Buffer, db: Database): string {
    const memoLength = buffer.readUIntLE(0, 3);

    const bitmask = buffer.readUInt8(3);
    if (bitmask & 0x80) {
        // inline
        return uncompressText(
            buffer.slice(12, 12 + memoLength),
            db.constants.format
        );
    } else if (bitmask & 0x40) {
        // single page
        const pageRow = buffer.readUInt32LE(32);
        const rowBuffer = db.findPageRow(pageRow);
        return uncompressText(
            rowBuffer.slice(0, memoLength),
            db.constants.format
        );
    } else if (bitmask === 0) {
        // multi page
        let pageRow = buffer.readInt32BE(4);
        let memoDataBuffer = Buffer.alloc(0);
        do {
            const rowBuffer = db.findPageRow(pageRow);

            if (memoDataBuffer.length + rowBuffer.length - 4 > memoLength) {
                break;
            }

            if (rowBuffer.length === 0) {
                break;
            }

            memoDataBuffer = Buffer.concat([
                memoDataBuffer,
                rowBuffer.slice(4, buffer.length),
            ]);

            pageRow = rowBuffer.readInt32BE(4);
        } while (pageRow !== 0);

        return uncompressText(
            memoDataBuffer.slice(0, memoLength),
            db.constants.format
        );
    } else {
        throw new Error(`Unknown memo type ${bitmask}`);
    }
}
