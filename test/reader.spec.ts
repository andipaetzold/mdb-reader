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

    let buffer: Buffer;
    let reader: MDBReader;

    beforeEach(() => {
        buffer = readFileSync(path);
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

    describe(".buffer", () => {
        it("should return input buffer", () => {
            const fileBuffer = readFileSync(path);
            expect(Buffer.compare(reader.buffer, fileBuffer)).toBe(0);
        });
    });

    it("should not modify the input buffer", () => {
        const fileBuffer = readFileSync(path);
        expect(Buffer.compare(buffer, fileBuffer)).toBe(0);
    });
});
