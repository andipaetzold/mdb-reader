import { Database } from "../Database.js";
import type { Value } from "../types.js";
import { Table } from "../Table.js";
import { getMSysObjectsTable } from "../systemTables.js";

const MSYS_COMPLEX_COLUMNS_TABLE = "MSysComplexColumns";

const COLUMN_NAMES = {
    complexTypeId: "ComplexTypeObjectID",
    /** ACCDB: column definition stores this; matches row in MSysComplexColumns. */
    conceptualTableId: "ConceptualTableID",
    /** Flat table ID. */
    flatTableId: "FlatTableID",
    /** Complex ID. */
    complexId: "ComplexID",
    /** Column name. */
    columnName: "ColumnName",
} as const;

export type ResolvedFlatTable = {
    tableName: string;
    firstPage: number;
};

/**
 * Resolves (complexTypeId, tableDefinitionPage) to the flat table that stores
 * attachment rows for that complex column. Uses MSysComplexColumns and MSysObjects.
 * When columnName is provided and no row matches by complexTypeId, falls back to
 * matching by ConceptualTableID + ColumnName (ACCDB stores a different ID in the column def).
 * Returns null if the system table is missing or no matching row is found.
 */
export function resolveFlatTableForComplexColumn(
    database: Database,
    complexTypeId: number,
    tableDefinitionPage: number,
    columnName: string,
): ResolvedFlatTable {
    const msysObjectsData = getMSysObjectsTable(database).getData<{ Id: number; Name: string }>({
        columns: ["Id", "Name"],
    });
    const complexColsData = getComplexColumnsData(database);
    const tableDefPageMasked = tableDefinitionPage & 0x00ffffff;

    for (const row of complexColsData) {
        const rowFlatTableId = row[COLUMN_NAMES.flatTableId];
        const rowConceptualTableId = row[COLUMN_NAMES.conceptualTableId];

        const tableMatch = rowConceptualTableId != null && (rowConceptualTableId as number) === tableDefPageMasked;
        if (!rowFlatTableId || !tableMatch) {
            continue;
        }

        // compare complex type id
        const rowComplexTypeId = row[COLUMN_NAMES.complexTypeId];
        const complexTypeIdMatch = typeof rowComplexTypeId === "number" && rowComplexTypeId === complexTypeId;

        // compare complex id
        const rowComplexId = row[COLUMN_NAMES.complexId];
        const complexIdMatch = typeof rowComplexId === "number" && rowComplexId === complexTypeId;

        // compare column name
        const rowColumnName = row[COLUMN_NAMES.columnName];
        const columnNameMatch =
            typeof rowColumnName === "string" && String(rowColumnName).toLowerCase() === columnName.toLowerCase();

        if (!complexTypeIdMatch && !complexIdMatch && !columnNameMatch) {
            continue;
        }

        const flatTableId = (rowFlatTableId as number) & 0x00ffffff;
        const flatTableRow = msysObjectsData.find((r) => (r.Id & 0x00ffffff) === flatTableId);
        if (!flatTableRow) {
            throw new Error(`Flat table not found for complex column ${columnName}`);
        }

        return {
            tableName: flatTableRow.Name,
            firstPage: flatTableId,
        };
    }

    throw new Error(`Flat table not found for complex column ${columnName}`);
}

function getMsysComplexColumnsPage(database: Database): number {
    const msysObjectsData = getMSysObjectsTable(database).getData<{ Id: number; Name: string }>({
        columns: ["Id", "Name"],
    });
    const complexColRow = msysObjectsData.find((r) => r.Name === MSYS_COMPLEX_COLUMNS_TABLE);
    if (!complexColRow) {
        throw new Error(`MSysComplexColumns table not found in MSysObjects table`);
    }
    return complexColRow.Id & 0x00ffffff;
}

function getComplexColumnsData(database: Database): Record<string, Value>[] {
    const msysComplexColumnsPage = getMsysComplexColumnsPage(database);
    const msysComplexColumns = new Table(MSYS_COMPLEX_COLUMNS_TABLE, database, msysComplexColumnsPage);
    return msysComplexColumns.getData<Record<string, Value>>();
}
