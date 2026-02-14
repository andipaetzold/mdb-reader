import type { Column, ColumnDefinition } from "../column.js";
import { Database } from "../Database.js";
import type { Attachment, Value } from "../types.js";
import { ColumnTypes } from "../types.js";
import { decodeAttachmentFileData } from "./attachment.js";
import { resolveFlatTableForComplexColumn } from "./msysComplexColumns.js";
import { Table } from "../Table.js";

/** Jackcess attachment flat table column names. */
const FILE_NAME = "FileName";
const FILE_TYPE = "FileType";
const FILE_DATA = "FileData";
const FILE_URL = "FileURL";
const FILE_TIME_STAMP = "FileTimeStamp";
const FILE_FLAGS = "FileFlags";

/** Known attachment type column names; the FK column is the Long that is not one of these. */
const ATTACHMENT_TYPE_COLUMN_NAMES = new Set([FILE_NAME, FILE_TYPE, FILE_DATA, FILE_URL, FILE_TIME_STAMP, FILE_FLAGS]);

/**
 * Reads a Complex (attachment) column: resolves the complex value FK to the flat table,
 * collects matching rows, and decodes each attachment's FileData.
 * Returns [] if resolution fails or column has no complexTypeId/tableDefinitionPage.
 */
export function readComplex( buffer: Buffer, column: Column, database: Database): Attachment[] {
    const def = column as ColumnDefinition;
    const complexTypeId = def.complexTypeId;
    const tableDefinitionPage = def.tableDefinitionPage;

    if (complexTypeId === undefined || tableDefinitionPage === undefined) {
        return [];
    }

    const fk = buffer.readInt32LE();
    if (fk === 0 || fk === -1) {
        return [];
    }

    const resolved = resolveFlatTableForComplexColumn(database, complexTypeId, tableDefinitionPage, def.name);
    if (!resolved) {
        return [];
    }

    try {
        const flatTable = new Table(resolved.flatTableName, database, resolved.flatTableFirstPage);
        const columns = flatTable.getColumns();

        const fkColumn = columns.find(
            (c) => c.type === ColumnTypes.Long && !c.autoLong && !ATTACHMENT_TYPE_COLUMN_NAMES.has(c.name),
        );
        if (!fkColumn) {
            return [];
        }

        const flatData = flatTable.getData<Record<string, Value>>();
        const matchingRows = flatData.filter((row) => row[fkColumn.name] === fk);

        return matchingRows.map((row) => {
            const rawData = row[FILE_DATA] ?? row["FileData"];

            const attachment: Attachment = {
                name: row[FILE_NAME] as string,
                type: row[FILE_TYPE] as string,
                data: Buffer.isBuffer(rawData) ? decodeAttachmentFileData(rawData) : Buffer.alloc(0),
            };

            if (row[FILE_URL] != null) {
                attachment.url = String(row[FILE_URL]);
            }
            if (row[FILE_TIME_STAMP] instanceof Date) {
                attachment.timestamp = row[FILE_TIME_STAMP];
            }
            if (typeof row[FILE_FLAGS] === "number") {
                attachment.flags = row[FILE_FLAGS];
            }

            return attachment;
        });
    } catch {
        return [];
    }
}
