import type { Database } from "../../Database.js";
import { getMSysObjectsTable } from "../../systemTables.js";
import { Table } from "../../Table.js";

export type ComplexColumnsData = {
    ComplexTypeObjectID?: number;
    ConceptualTableID?: number;
    FlatTableID?: number;
    ComplexID?: number;
    ColumnName?: string;
};

const MSYS_COMPLEX_COLUMNS_TABLE = "MSysComplexColumns";

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

export function getComplexColumnsData(database: Database): ComplexColumnsData[] {
    const msysComplexColumnsPage = getMsysComplexColumnsPage(database);
    const msysComplexColumns = new Table(MSYS_COMPLEX_COLUMNS_TABLE, database, msysComplexColumnsPage);
    return msysComplexColumns.getData<ComplexColumnsData>();
}
