import { Column } from "..";
import Database from "../Database";
import { uncompressText } from "../unicodeCompression";

export function readText(buffer: Buffer, _col: Column, db: Database): string {
    return uncompressText(buffer, db.format);
}
