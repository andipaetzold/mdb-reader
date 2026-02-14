import type { Column } from "../column.js";
import { Database } from "../Database.js";

export function readLong(buffer: Buffer, _column: Column, _database: Database): number {
    return buffer.readInt32LE();
}
