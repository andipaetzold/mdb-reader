import { readFileSync } from "fs";
import MDBReader, { Table } from "../src/index.js";
import { resolve } from "path";

describe("OLE", () => {
    let table: Table;

    beforeEach(() => {
        const path = resolve("test/data", "V2007", "ole.accdb");
        const buffer = readFileSync(path);
        const reader = new MDBReader(buffer);
        table = reader.getTable("Table1");
    });

    it("reads ole data ", () => {
        table.getData();
        // TODO: check for correct values
    });
});
