import { Database } from "../../Database.js";
import { getComplexColumnsData } from "./complesColumnsData.js";
import { getMSysObjectsTable } from "../../systemTables.js";
import type { ComplexColumnDefinition } from "../../column.js";

export type ResolvedFlatTable = {
    tableName: string;
    firstPage: number;
};

/**
 * Resolves (complexTypeId, tableDefinitionPage) to the flat table that stores
 * attachment rows for that complex column.
 * Throws if the system table is missing or no matching row is found.
 */
export function resolveFlatTableForComplexColumn(database: Database, column: ComplexColumnDefinition): ResolvedFlatTable {
    const msysObjectsData = getMSysObjectsTable(database).getData<{ Id: number; Name: string }>({
        columns: ["Id", "Name"],
    });
    const complexColsData = getComplexColumnsData(database);
    const tableDefPageMasked = maskId(column.tableDefinitionPage);

    for (const row of complexColsData) {
        const rowFlatTableId = row.FlatTableID;
        if (!rowFlatTableId) {
            continue;
        }

        const rowConceptualTableId = row.ConceptualTableID;
        const tableMatch = typeof rowConceptualTableId === "number" && rowConceptualTableId === tableDefPageMasked;
        if (!tableMatch) {
            continue;
        }

        const complexTypeIdMatch =
            typeof row.ComplexTypeObjectID === "number" && row.ComplexTypeObjectID === column.complexTypeId;
        const complexIdMatch = typeof row.ComplexID === "number" && row.ComplexID === column.complexTypeId;
        const columnNameMatch =
            typeof row.ColumnName === "string" && row.ColumnName.toLowerCase() === column.name.toLowerCase();

        if (!complexTypeIdMatch && !complexIdMatch && !columnNameMatch) {
            continue;
        }

        const flatTableId = maskId(rowFlatTableId);
        const flatTableRow = msysObjectsData.find((r) => maskId(r.Id) === flatTableId);
        if (!flatTableRow) {
            throw new Error(`Flat table not found for complex column ${column.name}`);
        }

        return {
            tableName: flatTableRow.Name,
            firstPage: flatTableId,
        };
    }

    throw new Error(`Flat table not found for complex column ${column.name}`);
}

function maskId(id: number): number {
    return id & 0x00ffffff;
}
