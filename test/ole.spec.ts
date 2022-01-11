import { readFileSync } from "fs";
import MDBReader, { Table } from "../src";
import { resolve } from "path";

let table: Table;

beforeEach(() => {
    const path = resolve(__dirname, "data", "V2007", "ole.accdb");
    const buffer = readFileSync(path);
    const reader = new MDBReader(buffer);
    table = reader.getTable("Table1");
});

it("reads ole data ", () => {
    table.getData();
    // TODO: check for correct values
});
