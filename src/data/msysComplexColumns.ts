import { Database } from "../Database.js";
import type { Value } from "../types.js";
import { Table } from "../Table.js";

const MSYS_OBJECTS_TABLE = "MSysObjects";
const MSYS_OBJECTS_PAGE = 2;
const MSYS_COMPLEX_COLUMNS_TABLE = "MSysComplexColumns";

/**
 * Column names in MSysComplexColumns (Jackcess / Access).
 * Casing may vary; we try exact match first.
 */
const COL_COMPLEX_TYPE_OBJECT_ID = "ComplexTypeObjectID";
const COL_CONCEPTUAL_TABLE_ID = "ConceptualTableID";
const COL_FLAT_TABLE_ID = "FlatTableID";
/** ACCDB: column definition stores this; matches row in MSysComplexColumns. */
const COL_COMPLEX_ID = "ComplexID";
const COL_COLUMN_NAME = "ColumnName";

export interface ResolvedFlatTable {
    flatTableName: string;
    flatTableFirstPage: number;
}

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
    columnName?: string,
): ResolvedFlatTable | null {
    try {
        const msysObjects = new Table(MSYS_OBJECTS_TABLE, database, MSYS_OBJECTS_PAGE);
        const msysObjectsData = msysObjects.getData<{ Id: number; Name: string }>({
            columns: ["Id", "Name"],
        });

        const complexColRow = msysObjectsData.find((r) => r.Name === MSYS_COMPLEX_COLUMNS_TABLE);
        if (!complexColRow) {
            return null;
        }

        const msysComplexColumnsPage = complexColRow.Id & 0x00ffffff;
        const msysComplexColumns = new Table(MSYS_COMPLEX_COLUMNS_TABLE, database, msysComplexColumnsPage);
        const complexColsData = msysComplexColumns.getData<Record<string, Value>>();

        const tableDefPageMasked = tableDefinitionPage & 0x00ffffff;

        for (const row of complexColsData) {
            const rowComplexTypeId = row[COL_COMPLEX_TYPE_OBJECT_ID];
            const rowComplexId = row[COL_COMPLEX_ID];
            const rowConceptualTableId = row[COL_CONCEPTUAL_TABLE_ID];
            const rowFlatTableId = row[COL_FLAT_TABLE_ID];
            const rowColumnName = row[COL_COLUMN_NAME];

            const tableMatch = rowConceptualTableId != null && (rowConceptualTableId as number) === tableDefPageMasked;
            const complexMatch =
                (rowComplexTypeId != null && (rowComplexTypeId as number) === complexTypeId) ||
                (rowComplexId != null && (rowComplexId as number) === complexTypeId);
            const columnNameMatch =
                columnName != null &&
                rowColumnName != null &&
                String(rowColumnName).toLowerCase() === columnName.toLowerCase();

            if (tableMatch && rowFlatTableId != null && (complexMatch || columnNameMatch)) {
                const flatTableId = (rowFlatTableId as number) & 0x00ffffff;
                const flatTableRow = msysObjectsData.find((r) => (r.Id & 0x00ffffff) === flatTableId);
                if (!flatTableRow) {
                    return null;
                }
                return {
                    flatTableName: flatTableRow.Name,
                    flatTableFirstPage: flatTableId,
                };
            }
        }

        return null;
    } catch {
        return null;
    }
}
