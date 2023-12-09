import type { Column } from "../index.js";
import type { Database } from "../Database.js";
import { uncompressText } from "../unicodeCompression.js";

export function readText(buffer: Buffer, _col: Column, database: Database): string {
    return uncompressText(buffer, database.format);
}
