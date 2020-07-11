import { ColumnDefinition } from "./column";

export function readFieldValue(buffer: Buffer, column: ColumnDefinition): any {
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
        case "binary": {
            return readBinary(buffer);
        }
        case "text": {
            return readText(buffer);
        }
        case "repid":
            return readRepID(buffer);
        case "datetime":
            return readDateTime(buffer);
        default:
            console.warn(
                `Column type ${column.type} is currently not supported. Returning null.`
            );
            return null;
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

function readText(buffer: Buffer): string {
    // TODO: decrypt
    return buffer.toString("ucs-2");
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
