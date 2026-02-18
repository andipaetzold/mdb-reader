import type { ColumnDefinition, ComplexColumnDefinition } from "../../column.js";
import { Database } from "../../Database.js";
import { Table } from "../../Table.js";
import type { Attachment, Value } from "../../types.js";
import { ColumnTypes } from "../../types.js";
import { decodeAttachmentFileData } from "./attachment.js";
import { resolveFlatTableForComplexColumn } from "./utils.js";

type FlatTableData = {
    FileName: string;
    FileType: string;
    FileData: Buffer;
    FileURL?: string;
    FileTimeStamp?: Date;
    FileFlags?: number;

    // Foreign key column
    [key: string]: Value;
};
/** Known attachment type column names; the FK column is the Long that is not one of these. */
const ATTACHMENT_TYPE_COLUMN_NAMES: ReadonlySet<string> = new Set([
    "FileName",
    "FileType",
    "FileData",
    "FileURL",
    "FileTimeStamp",
    "FileFlags",
]);

/**
 * Reads a Complex (attachment) column: resolves the complex value FK to the flat table,
 * collects matching rows, and decodes each attachment's FileData.
 */
export function readComplex(buffer: Buffer, column: ColumnDefinition, database: Database): Attachment[] {
    try {
        const complexTypeId = column.complex?.typeId;
        const tableDefinitionPage = column.complex?.tableDefinitionPage;

        if (complexTypeId === undefined || tableDefinitionPage === undefined) {
            throw new Error("Complex column is not valid");
        }
        const complexColumnDefinition: ComplexColumnDefinition = {
            ...column,
            complex: {
                typeId: complexTypeId,
                tableDefinitionPage,
            },
        };

        const foreignKey = buffer.readInt32LE(0);
        if (foreignKey <= 0) {
            throw new Error("Foreign key value is not valid");
        }

        const { tableName: flatTableName, firstPage: flatTableFirstPage } = resolveFlatTableForComplexColumn(
            database,
            complexColumnDefinition,
        );
        const flatTable = new Table(flatTableName, database, flatTableFirstPage);
        const foreignKeyColumn = flatTable
            .getColumns()
            .find((c) => c.type === ColumnTypes.Long && !c.autoLong && !ATTACHMENT_TYPE_COLUMN_NAMES.has(c.name));
        if (!foreignKeyColumn) {
            throw new Error("Foreign key column not found");
        }

        const flatData = flatTable.getData<FlatTableData>();
        const matchingRows = flatData.filter((row) => row[foreignKeyColumn.name] === foreignKey);

        return matchingRows.map((row) => {
            const attachment: Attachment = {
                name: row.FileName,
                type: row.FileType,
                data: decodeAttachmentFileData(row.FileData),
            };

            if (row.FileURL) {
                attachment.url = row.FileURL;
            }
            if (row.FileTimeStamp) {
                attachment.timestamp = row.FileTimeStamp;
            }
            if (row.FileFlags) {
                attachment.flags = row.FileFlags;
            }

            return attachment;
        });
    } catch (error) {
        throw new Error("Failed to read complex column", { cause: error });
    }
}
