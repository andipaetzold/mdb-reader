import type { Column, ColumnDefinition } from "../column.js";
import { Database } from "../Database.js";
import type { Attachment, Value } from "../types.js";
import { ColumnTypes } from "../types.js";
import { decodeAttachmentFileData } from "./attachment.js";
import { resolveFlatTableForComplexColumn } from "./msysComplexColumns.js";
import { Table } from "../Table.js";

const COLUMN_NAMES = {
    name: "FileName",
    type: "FileType",
    data: "FileData",
    url: "FileURL",
    timestamp: "FileTimeStamp",
    flags: "FileFlags",
} as const;

/** Known attachment type column names; the FK column is the Long that is not one of these. */
const ATTACHMENT_TYPE_COLUMN_NAMES: ReadonlySet<string> = new Set(Object.values(COLUMN_NAMES));

/**
 * Reads a Complex (attachment) column: resolves the complex value FK to the flat table,
 * collects matching rows, and decodes each attachment's FileData.
 * Returns [] if resolution fails or column has no complexTypeId/tableDefinitionPage.
 */
export function readComplex(buffer: Buffer, column: ColumnDefinition, database: Database): Attachment[] {
    const complexTypeId = column.complexTypeId;
    const tableDefinitionPage = column.tableDefinitionPage;

    if (complexTypeId === undefined || tableDefinitionPage === undefined) {
        throw new Error("Complex column is not valid");
    }

    const fk = buffer.readInt32LE();
    if (fk <= 0) {
        throw new Error("FK value is not valid");
    }

    const { tableName: flatTableName, firstPage: flatTableFirstPage } = resolveFlatTableForComplexColumn(
        database,
        complexTypeId,
        tableDefinitionPage,
        column.name,
    );
    const flatTable = new Table(flatTableName, database, flatTableFirstPage);
    const columns = flatTable.getColumns();

    const fkColumn = columns.find(
        (c) => c.type === ColumnTypes.Long && !c.autoLong && !ATTACHMENT_TYPE_COLUMN_NAMES.has(c.name),
    );
    if (!fkColumn) {
        throw new Error("FK column not found");
    }

    const flatData = flatTable.getData<Record<string, Value>>();
    const matchingRows = flatData.filter((row) => row[fkColumn.name] === fk);

    return matchingRows.map((row) => {
        const data = row[COLUMN_NAMES.data];

        const attachment: Attachment = {
            name: row[COLUMN_NAMES.name] as string,
            type: row[COLUMN_NAMES.type] as string,
            data: Buffer.isBuffer(data) ? decodeAttachmentFileData(data) : Buffer.alloc(0),
        };

        const url = row[COLUMN_NAMES.url];
        const timestamp = row[COLUMN_NAMES.timestamp];
        const flags = row[COLUMN_NAMES.flags];
        if (url != null) {
            attachment.url = String(url);
        }
        if (timestamp instanceof Date) {
            attachment.timestamp = timestamp;
        }
        if (typeof flags === "number") {
            attachment.flags = flags;
        }

        return attachment;
    });
}
