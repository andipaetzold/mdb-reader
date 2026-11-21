import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { resolve } from "path";
import { readFileSync } from "fs";
import { readers } from "./readers.js";
import type { Table } from "../src/index.js";
import { Database } from "../src/Database.js";
import { environment } from "../src/environment/node.js";
import { Table as TableDefinition } from "../src/Table.js";

describe.each(readers)("Table ($platform)", ({ MDBReader }) => {
    // The test databases are slightly different, so we need some extra arguments here
    describe.each([
        ["V1997/test.mdb", true, 50, 100, 50],
        ["V2000/test.mdb", false, 100, 200, 100],
        ["V2003/test.mdb", false, 100, 200, 100],
        ["V2007/test.accdb", true, 100, 200, 100],
        ["V2010/test.accdb", true, 100, 200, 100],
    ])("%s", (filename, reverseRows, columnALength, columnBLength, table4Length) => {
        const path = resolve("test/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        it("getData()", () => {
            const reader = new MDBReader(buffer);
            const table = reader.getTable("Table1");
            const rows = table.getData();

            if (reverseRows) {
                rows.reverse();
            }

            expect(rows[0]!["A"]).toBe("abcdefg");
            expect(rows[0]!["B"]).toBe("hijklmnop");
            expect(rows[0]!["C"]).toBe(2);
            expect(rows[0]!["D"]).toBe(222);
            expect(rows[0]!["E"]).toBe(333333333);
            expect(rows[0]!["F"]).toBe(444.555);
            expect((rows[0]!["G"] as Date).getTime()).toBe(148953600000); // TODO: check expected value
            expect(rows[0]!["H"]).toBe("3.5000");
            expect(rows[0]!["I"]).toBe(true);

            expect(rows[1]!["A"]).toBe("a");
            expect(rows[1]!["B"]).toBe("b");
            expect(rows[1]!["C"]).toBe(0);
            expect(rows[1]!["D"]).toBe(0);
            expect(rows[1]!["E"]).toBe(0);
            expect(rows[1]!["F"]).toBe(0);
            expect((rows[1]!["G"] as Date).getTime()).toBe(376963200000); // TODO: check expected value
            expect(rows[1]!["H"]).toBe("0.0000");
            expect(rows[1]!["I"]).toBe(false);
        });

        describe("getColumns()", () => {
            it("returns correct data types", () => {
                const reader = new MDBReader(buffer);
                const table = reader.getTable("Table1");
                const columns = table.getColumns();

                expect(columns[0]!.name).toBe("A");
                expect(columns[0]!.type).toBe("text");
                expect(columns[0]!.size).toBe(columnALength);

                expect(columns[1]!.name).toBe("B");
                expect(columns[1]!.type).toBe("text");
                expect(columns[1]!.size).toBe(columnBLength);

                expect(columns[2]!.name).toBe("C");
                expect(columns[2]!.type).toBe("byte");

                expect(columns[3]!.name).toBe("D");
                expect(columns[3]!.type).toBe("integer");

                expect(columns[4]!.name).toBe("E");
                expect(columns[4]!.type).toBe("long");

                expect(columns[5]!.name).toBe("F");
                expect(columns[5]!.type).toBe("double");

                expect(columns[6]!.name).toBe("G");
                expect(columns[6]!.type).toBe("datetime");

                expect(columns[7]!.name).toBe("H");
                expect(columns[7]!.type).toBe("currency");

                expect(columns[8]!.name).toBe("I");
                expect(columns[8]!.type).toBe("boolean");
            });

            it("can handle many columns", () => {
                const reader = new MDBReader(buffer);
                const table = reader.getTable("Table2");
                const columns = table.getColumns();

                expect(columns.length).toBe(89);
                for (let i = 0; i < 89; ++i) {
                    expect(columns[i]!.name).toBe(`column${i + 1}`);
                    expect(columns[i]!.type).toBe("text");
                    expect(columns[i]!.size).toBe(table4Length);
                }
            });
        });

        it("getColumnNames()", () => {
            const reader = new MDBReader(buffer);
            const table = reader.getTable("Table1");
            const columnNames = table.getColumnNames();

            expect(columnNames).toEqual(["A", "B", "C", "D", "E", "F", "G", "H", "I"]);
        });
    });

    describe("getData()", () => {
        describe("real/ASampleDatabase.accdb", () => {
            const path = resolve("test/data/real/ASampleDatabase.accdb");
            let table: Table;

            beforeAll(() => {
                const buffer = readFileSync(path);
                const reader = new MDBReader(buffer);
                table = reader.getTable("Asset Items");
            });

            it("no options", () => {
                const rows = table.getData();
                expect(rows.length).toBe(65);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).toBe(65);
            });

            it("with rowOffset", () => {
                const rows = table.getData({ rowOffset: 30 });
                expect(rows.length).toBe(35);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).toBe(35);
            });

            it("with rowOffset > rowCount", () => {
                const rows = table.getData({ rowOffset: 100 });
                expect(rows.length).toBe(0);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).toBe(0);
            });

            it("with rowLimit", () => {
                const rows = table.getData({ rowLimit: 40 });
                expect(rows.length).toBe(40);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).toBe(40);
            });

            it("with rowLimit > rowCount", () => {
                const rows = table.getData({ rowLimit: 100 });
                expect(rows.length).toBe(65);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).toBe(65);
            });

            it("with rowOffset & rowLimit", () => {
                const rows = table.getData({ rowOffset: 30, rowLimit: 15 });
                expect(rows.length).toBe(15);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).toBe(15);
            });
        });

        describe("V2016/withdeletedcol.accdb", () => {
            it("with offset column indices due to a column deletion", () => {
                const withDeletedColPath = resolve("test/data/V2016/withdeletedcol.accdb");
                const buffer = readFileSync(withDeletedColPath);
                const reader = new MDBReader(buffer);
                const withDeletedColTable = reader.getTable("Table1");

                expect(withDeletedColTable.getData()).toEqual([
                    { col1: 0, col2: 1, col3: 2, col5: 4, col6: 5, col7: 6, col8: 7 },
                ]);
            });
        });

        describe("V2016/withinsertedcol.accdb", () => {
            it("with offset column indices due to a column insertion", () => {
                const withInsertedColPath = resolve("test/data/V2016/withinsertedcol.accdb");
                const buffer = readFileSync(withInsertedColPath);
                const reader = new MDBReader(buffer);
                const withInsertedColTable = reader.getTable("Table1");

                expect(withInsertedColTable.getData()).toEqual([{ col1: true, col2: true, col3: false }]);
            });
        });
    });
});

describe("cyclic table definitions", () => {
    describe.each([
        ["V1997/test.mdb", 2048, 34, 44],
        ["V2000/test.mdb", 4096, 30, 708],
        ["V2003/test.mdb", 4096, 30, 708],
        ["V2007/test.accdb", 4096, 67, 78],
        ["V2010/test.accdb", 4096, 79, 90],
    ])("%s", (filename, pageSize, firstPage, secondPage) => {
        it.each([
            ["A→A", false, false],
            ["A→B→A", true, false],
            ["A→B→B", true, true],
        ])("rejects %s", (_chain, useSecondPage, repeatSecondPage) => {
            const buffer = Buffer.from(readFileSync(resolve("test/data", filename)));
            const repeatedPage = repeatSecondPage ? secondPage : firstPage;
            buffer.writeUInt32LE(useSecondPage ? secondPage : firstPage, firstPage * pageSize + 4);
            if (useSecondPage) {
                buffer.writeUInt32LE(repeatedPage, secondPage * pageSize + 4);
            }
            const originalBuffer = Buffer.from(buffer);
            const database = new Database(buffer, "", environment);
            const getPage = database.getPage.bind(database);
            let reads = 0;
            database.getPage = (page) => {
                if (++reads > 4) {
                    throw new Error("Test table-definition read budget exceeded");
                }
                return getPage(page);
            };

            expect(() => new TableDefinition("Table2", database, firstPage)).toThrow(
                new Error(`Cyclic table definition for table "Table2": repeated page ${repeatedPage}`)
            );
            expect(reads).toBe(useSecondPage ? 2 : 1);
            expect(buffer.equals(originalBuffer)).toBe(true);
        });

        it("rejects a catalog self-loop", () => {
            const buffer = Buffer.from(readFileSync(resolve("test/data", filename)));
            buffer.writeUInt32LE(2, 2 * pageSize + 4);
            const originalBuffer = Buffer.from(buffer);
            const database = new Database(buffer, "", environment);
            const getPage = database.getPage.bind(database);
            let reads = 0;
            database.getPage = (page) => {
                if (++reads > 4) {
                    throw new Error("Test catalog read budget exceeded");
                }
                return getPage(page);
            };

            expect(() => new TableDefinition("MSysObjects", database, 2)).toThrow(
                new Error('Cyclic table definition for table "MSysObjects": repeated page 2')
            );
            expect(reads).toBe(1);
            expect(buffer.equals(originalBuffer)).toBe(true);
        });
    });
});
