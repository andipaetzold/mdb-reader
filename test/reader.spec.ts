import { resolve } from "path";
import { readFileSync } from "fs";
import { createMDBReader } from "../src/index.js";
import forEach from "mocha-each";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect } = chai;

describe("createMDBReader", () => {
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
            it("returns table", async () => {
                const reader = await createMDBReader(buffer);
                const table = await reader.getTable("Table1");
                expect(table.name).to.eq("Table1");
                expect(table.rowCount).to.eq(2);
            });

            it("throws error for unknown table", async () => {
                const reader = await createMDBReader(buffer);
                await expect(reader.getTable("unknown")).to.eventually.be.rejected;
            });
        });

        it("getTableNames()", async () => {
            const reader = await createMDBReader(buffer);
            const tableNames = await reader.getTableNames();
            expect(tableNames).to.deep.eq(["Table1", "Table2", "Table3", "Table4"]);
        });

        it("should not modify the input buffer", () => {
            const fileBuffer = readFileSync(path);
            expect(Buffer.compare(buffer, fileBuffer)).to.eq(0);
        });
    });
});
