import type { Database } from "../Database.js";
import { type ColumnDefinition, getColumnType, parseColumnFlags } from "../column.js";
import { ColumnTypes } from "../types.js";
import { uncompressText } from "../unicodeCompression.js";

interface Options {
    database: Database;
    realIndexCount: number;
    columnCount: number;
    definitionBuffer: Buffer;
}

export function getColumnDefinitions({
    database,
    realIndexCount,
    columnCount,
    definitionBuffer,
}: Options): ColumnDefinition[] {
    const columns: ColumnDefinition[] = [];

    let curDefinitionPos =
        database.format.tableDefinitionPage.realIndexStartOffset +
        realIndexCount * database.format.tableDefinitionPage.realIndexEntrySize;

    let namesCursorPos = curDefinitionPos + columnCount * database.format.tableDefinitionPage.columnsDefinition.entrySize;

    for (let i = 0; i < columnCount; ++i) {
        const columnBuffer = definitionBuffer.slice(
            curDefinitionPos,
            curDefinitionPos + database.format.tableDefinitionPage.columnsDefinition.entrySize
        );

        const type = getColumnType(
            definitionBuffer.readUInt8(curDefinitionPos + database.format.tableDefinitionPage.columnsDefinition.typeOffset)
        );

        const nameLength = definitionBuffer.readUIntLE(
            namesCursorPos,
            database.format.tableDefinitionPage.columnNames.nameLengthSize
        );
        namesCursorPos += database.format.tableDefinitionPage.columnNames.nameLengthSize;
        const name = uncompressText(definitionBuffer.slice(namesCursorPos, namesCursorPos + nameLength), database.format);
        namesCursorPos += nameLength;

        const column: ColumnDefinition = {
            name,
            type,
            index: columnBuffer.readUInt8(database.format.tableDefinitionPage.columnsDefinition.indexOffset),
            variableIndex: columnBuffer.readUInt8(database.format.tableDefinitionPage.columnsDefinition.variableIndexOffset),
            size:
                type === ColumnTypes.Boolean
                    ? 0
                    : columnBuffer.readUInt16LE(database.format.tableDefinitionPage.columnsDefinition.sizeOffset),
            fixedIndex: columnBuffer.readUInt16LE(database.format.tableDefinitionPage.columnsDefinition.fixedIndexOffset),
            ...parseColumnFlags(columnBuffer.readUInt8(database.format.tableDefinitionPage.columnsDefinition.flagsOffset)),
        };

        if (type === ColumnTypes.Numeric) {
            column.precision = columnBuffer.readUInt8(11);
            column.scale = columnBuffer.readUInt8(12);
        }

        columns.push(column);

        curDefinitionPos += database.format.tableDefinitionPage.columnsDefinition.entrySize;
    }

    return columns;
}
