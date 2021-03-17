import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader, { Table } from "../src";

// The test databases are slightly different, so we need some extra arguments here
describe.each`
    filename              | reverseRows | columnALength | columnBLength | table4Length
    ${"V1997/test.mdb"}   | ${true}     | ${50}         | ${100}        | ${50}
    ${"V2000/test.mdb"}   | ${false}    | ${100}        | ${200}        | ${100}
    ${"V2003/test.mdb"}   | ${false}    | ${100}        | ${200}        | ${100}
    ${"V2007/test.accdb"} | ${true}     | ${100}        | ${200}        | ${100}
    ${"V2010/test.accdb"} | ${true}     | ${100}        | ${200}        | ${100}
`("$filename", ({ filename, reverseRows, columnALength, columnBLength, table4Length }) => {
    const path = resolve(__dirname, "data", filename);

    let reader: MDBReader;

    beforeEach(() => {
        const buffer = readFileSync(path);
        reader = new MDBReader(buffer);
    });

    it("getData()", () => {
        const table = reader.getTable("Table1");
        const rows = table.getData();

        if (reverseRows) {
            rows.reverse();
        }

        expect(rows[0]["A"]).toBe("abcdefg");
        expect(rows[0]["B"]).toBe("hijklmnop");
        expect(rows[0]["C"]).toBe(2);
        expect(rows[0]["D"]).toBe(222);
        expect(rows[0]["E"]).toBe(333333333);
        expect(rows[0]["F"]).toBe(444.555);
        expect((rows[0]["G"] as Date).getTime()).toBe(148953600000); // TODO: check expected value
        expect(rows[0]["H"]).toBe("3.5000");
        expect(rows[0]["I"]).toBe(true);

        expect(rows[1]["A"]).toBe("a");
        expect(rows[1]["B"]).toBe("b");
        expect(rows[1]["C"]).toBe(0);
        expect(rows[1]["D"]).toBe(0);
        expect(rows[1]["E"]).toBe(0);
        expect(rows[1]["F"]).toBe(0);
        expect((rows[1]["G"] as Date).getTime()).toBe(376963200000); // TODO: check expected value
        expect(rows[1]["H"]).toBe("0.0000");
        expect(rows[1]["I"]).toBe(false);
    });

    describe("getColumns()", () => {
        it("returns correct data types", () => {
            const table = reader.getTable("Table1");
            const columns = table.getColumns();

            expect(columns[0].name).toBe("A");
            expect(columns[0].type).toBe("text");
            expect(columns[0].size).toBe(columnALength);

            expect(columns[1].name).toBe("B");
            expect(columns[1].type).toBe("text");
            expect(columns[1].size).toBe(columnBLength);

            expect(columns[2].name).toBe("C");
            expect(columns[2].type).toBe("byte");

            expect(columns[3].name).toBe("D");
            expect(columns[3].type).toBe("integer");

            expect(columns[4].name).toBe("E");
            expect(columns[4].type).toBe("long");

            expect(columns[5].name).toBe("F");
            expect(columns[5].type).toBe("double");

            expect(columns[6].name).toBe("G");
            expect(columns[6].type).toBe("datetime");

            expect(columns[7].name).toBe("H");
            expect(columns[7].type).toBe("currency");

            expect(columns[8].name).toBe("I");
            expect(columns[8].type).toBe("boolean");
        });

        it("can handle many columns", () => {
            const table = reader.getTable("Table2");
            const columns = table.getColumns();

            expect(columns.length).toBe(89);
            for (let i = 0; i < 89; ++i) {
                expect(columns[i].name).toBe(`column${i + 1}`);
                expect(columns[i].type).toBe("text");
                expect(columns[i].size).toBe(table4Length);
            }
        });
    });

    it("getColumnNames()", () => {
        const table = reader.getTable("Table1");
        const columnNames = table.getColumnNames();

        expect(columnNames).toStrictEqual(["A", "B", "C", "D", "E", "F", "G", "H", "I"]);
    });
});

describe.only("getData()", () => {
    const path = resolve(__dirname, "data/real/ASampleDatabase.accdb");
    let table: Table;

    beforeEach(() => {
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
