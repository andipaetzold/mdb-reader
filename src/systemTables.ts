import { Database } from "./Database.js";
import { Table } from "./Table.js";

export function getMSysObjectsTable(database: Database): Table {
    return new Table("MSysObjects", database, 2);
}

