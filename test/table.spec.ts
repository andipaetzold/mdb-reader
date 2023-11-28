import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader, { type Table } from "../src/index.js";
import { expect } from "chai";
import forEach from "mocha-each";

describe("Table", () => {
    // The test databases are slightly different, so we need some extra arguments here
    forEach([
        ["V1997/test.mdb", true, 50, 100, 50],
        ["V2000/test.mdb", false, 100, 200, 100],
        ["V2003/test.mdb", false, 100, 200, 100],
        ["V2007/test.accdb", true, 100, 200, 100],
        ["V2010/test.accdb", true, 100, 200, 100],
    ]).describe("%s", (filename, reverseRows, columnALength, columnBLength, table4Length) => {
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

            expect(rows[0]!["A"]).to.eq("abcdefg");
            expect(rows[0]!["B"]).to.eq("hijklmnop");
            expect(rows[0]!["C"]).to.eq(2);
            expect(rows[0]!["D"]).to.eq(222);
            expect(rows[0]!["E"]).to.eq(333333333);
            expect(rows[0]!["F"]).to.eq(444.555);
            expect((rows[0]!["G"] as Date).getTime()).to.eq(148953600000); // TODO: check expected value
            expect(rows[0]!["H"]).to.eq("3.5000");
            expect(rows[0]!["I"]).to.eq(true);

            expect(rows[1]!["A"]).to.eq("a");
            expect(rows[1]!["B"]).to.eq("b");
            expect(rows[1]!["C"]).to.eq(0);
            expect(rows[1]!["D"]).to.eq(0);
            expect(rows[1]!["E"]).to.eq(0);
            expect(rows[1]!["F"]).to.eq(0);
            expect((rows[1]!["G"] as Date).getTime()).to.eq(376963200000); // TODO: check expected value
            expect(rows[1]!["H"]).to.eq("0.0000");
            expect(rows[1]!["I"]).to.eq(false);
        });

        describe("getColumns()", () => {
            it("returns correct data types", () => {
                const reader = new MDBReader(buffer);
                const table = reader.getTable("Table1");
                const columns = table.getColumns();

                expect(columns[0]!.name).to.eq("A");
                expect(columns[0]!.type).to.eq("text");
                expect(columns[0]!.size).to.eq(columnALength);

                expect(columns[1]!.name).to.eq("B");
                expect(columns[1]!.type).to.eq("text");
                expect(columns[1]!.size).to.eq(columnBLength);

                expect(columns[2]!.name).to.eq("C");
                expect(columns[2]!.type).to.eq("byte");

                expect(columns[3]!.name).to.eq("D");
                expect(columns[3]!.type).to.eq("integer");

                expect(columns[4]!.name).to.eq("E");
                expect(columns[4]!.type).to.eq("long");

                expect(columns[5]!.name).to.eq("F");
                expect(columns[5]!.type).to.eq("double");

                expect(columns[6]!.name).to.eq("G");
                expect(columns[6]!.type).to.eq("datetime");

                expect(columns[7]!.name).to.eq("H");
                expect(columns[7]!.type).to.eq("currency");

                expect(columns[8]!.name).to.eq("I");
                expect(columns[8]!.type).to.eq("boolean");
            });

            it("can handle many columns", () => {
                const reader = new MDBReader(buffer);
                const table = reader.getTable("Table2");
                const columns = table.getColumns();

                expect(columns.length).to.eq(89);
                for (let i = 0; i < 89; ++i) {
                    expect(columns[i]!.name).to.eq(`column${i + 1}`);
                    expect(columns[i]!.type).to.eq("text");
                    expect(columns[i]!.size).to.eq(table4Length);
                }
            });
        });

        it("getColumnNames()", () => {
            const reader = new MDBReader(buffer);
            const table = reader.getTable("Table1");
            const columnNames = table.getColumnNames();

            expect(columnNames).to.deep.eq(["A", "B", "C", "D", "E", "F", "G", "H", "I"]);
        });
    });

    describe("getData()", () => {
        describe("real/ASampleDatabase.accdb", () => {
            const path = resolve("test/data/real/ASampleDatabase.accdb");
            let table: Table;

            before(() => {
                const buffer = readFileSync(path);
                const reader = new MDBReader(buffer);
                table = reader.getTable("Asset Items");
            });

            it("no options", () => {
                const rows = table.getData();
                expect(rows.length).to.eq(65);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).to.eq(65);
            });

            it("with rowOffset", () => {
                const rows = table.getData({ rowOffset: 30 });
                expect(rows.length).to.eq(35);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).to.eq(35);
            });

            it("with rowOffset > rowCount", () => {
                const rows = table.getData({ rowOffset: 100 });
                expect(rows.length).to.eq(0);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).to.eq(0);
            });

            it("with rowLimit", () => {
                const rows = table.getData({ rowLimit: 40 });
                expect(rows.length).to.eq(40);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).to.eq(40);
            });

            it("with rowLimit > rowCount", () => {
                const rows = table.getData({ rowLimit: 100 });
                expect(rows.length).to.eq(65);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).to.eq(65);
            });

            it("with rowOffset & rowLimit", () => {
                const rows = table.getData({ rowOffset: 30, rowLimit: 15 });
                expect(rows.length).to.eq(15);

                const assetNumbers = rows.map((row) => row["Asset No"]);
                expect(new Set(assetNumbers).size).to.eq(15);
            });
        });

        describe("V2016/withdeletedcol.accdb", () => {
            it("with offset column indices due to a column deletion", () => {
                const withDeletedColPath = resolve("test/data/V2016/withdeletedcol.accdb");
                const buffer = readFileSync(withDeletedColPath);
                const reader = new MDBReader(buffer);
                const withDeletedColTable = reader.getTable("Table1");

                expect(withDeletedColTable.getData()).to.deep.eq([
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

                expect(withInsertedColTable.getData()).to.deep.eq([{ col1: true, col2: true, col3: false }]);
            });
        });
    });
});
