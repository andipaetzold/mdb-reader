import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src";

describe.each`
    filename              | format
    ${"V1997/test.mdb"}   | ${"Jet3"}
    ${"V2000/test.mdb"}   | ${"Jet4"}
    ${"V2003/test.mdb"}   | ${"Jet4"}
    ${"V2007/test.accdb"} | ${"Jet4"}
    ${"V2010/test.accdb"} | ${"Jet4"}
`("$filename", ({ filename, format }) => {
    const path = resolve(__dirname, "data", filename);

    let reader: MDBReader;

    beforeEach(() => {
        const buffer = readFileSync(path);
        reader = new MDBReader(buffer);
    });

    it("getFormat()", () => {
        expect(reader.getFormat()).toBe(format);
    });

    describe("getTable()", () => {
        it("returns table", () => {
            const table = reader.getTable("Table1");
            expect(table.name).toBe("Table1");
            expect(table.rowCount).toBe(2);
        });

        it("throws error for unknown table", () => {
            expect(() => reader.getTable("unknown")).toThrowError();
        });
    });

    it("getTableNames()", () => {
        const tableNames = reader.getTableNames();
        expect(tableNames).toStrictEqual(["Table1", "Table2", "Table3", "Table4"]);
    });
});
