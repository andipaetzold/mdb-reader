import { resolve } from "path";
import { readFileSync } from "fs";
import { MDBReader } from "../src/index.js";
import forEach from "mocha-each";
import { expect } from "chai";

describe("MDBReader", () => {
    forEach([
        ["V1997/test.mdb"],
        ["V2000/test.mdb"],
        ["V2003/test.mdb"],
        ["V2007/test.accdb"],
        ["V2010/test.accdb"],
    ]).describe("%s", (filename) => {
        const path = resolve("test/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        describe("getTable()", () => {
            it("returns table", () => {
                const reader = new MDBReader(buffer);
                const table = reader.getTable("Table1");
                expect(table.name).to.eq("Table1");
                expect(table.rowCount).to.eq(2);
            });

            it("throws error for unknown table", () => {
                const reader = new MDBReader(buffer);
                expect(() => reader.getTable("unknown")).to.throw();
            });
        });

        it("getTableNames()", () => {
            const reader = new MDBReader(buffer);
            const tableNames = reader.getTableNames();
            expect(tableNames).to.deep.eq(["Table1", "Table2", "Table3", "Table4"]);
        });

        it("should not modify the input buffer", () => {
            const fileBuffer = readFileSync(path);
            expect(Buffer.compare(buffer, fileBuffer)).to.eq(0);
        });
    });
});
