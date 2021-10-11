import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src";

describe.each`
    filename
    ${"V1997/test.mdb"}
    ${"V2000/test.mdb"}
    ${"V2003/test.mdb"}
    ${"V2007/test.accdb"}
    ${"V2010/test.accdb"}
`("$filename", ({ filename }) => {
    const path = resolve(__dirname, "data", filename);

    let reader: MDBReader;

    beforeEach(() => {
        const buffer = readFileSync(path);
        reader = new MDBReader(buffer);
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
