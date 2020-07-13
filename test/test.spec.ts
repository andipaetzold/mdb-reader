import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src";

const files = [
    // "V1997/test.mdb", // TODO: fix Jet3
    "V2000/test.mdb",
    "V2003/test.mdb",
    "V2007/test.accdb",
    "V2010/test.accdb",
];

files.forEach((filename) => {
    describe(filename, () => {
        const path = resolve(__dirname, "data", filename);

        let reader: MDBReader;

        beforeEach(() => {
            const buffer = readFileSync(path);
            reader = new MDBReader(buffer);
        });

        it("getTableNames()", () => {
            const tableNames = reader.getTableNames();
            expect(tableNames).toStrictEqual([
                "Table1",
                "Table2",
                "Table3",
                "Table4",
            ]);
        });

        it("getData()", () => {
            const table = reader.getTable("Table1");
            const rows = table.getData();

            if (filename.endsWith(".accdb")) {
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

        it("getColumns()", () => {
            const table = reader.getTable("Table1");
            const columns = table.getColumns();

            expect(columns[0].name).toBe("A");
            expect(columns[0].type).toBe("text");
            expect(columns[0].size).toBe(100);

            expect(columns[1].name).toBe("B");
            expect(columns[1].type).toBe("text");
            expect(columns[1].size).toBe(200);

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

        it("getColumnNames()", () => {
            const table = reader.getTable("Table1");
            const columnNames = table.getColumnNames();

            expect(columnNames).toStrictEqual([
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
            ]);
        });
    });
});
