import type { Column } from "../column.js";
import { Database } from "../Database.js";
import { uncompressText } from "../unicodeCompression.js";

export function readText(buffer: Buffer, _col: Column, database: Database): string {
    return uncompressText(buffer, database.format);
}
