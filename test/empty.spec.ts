import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src";

const files = [
    "empty.mdb",
    "empty2003.mdb",
    "empty2007.accdb",
    "empty2010.accdb",
    "empty2016.accdb",
];

files.forEach((file) => {
    describe(file, () => {
        const filename = resolve(__dirname, "data", file);

        let reader: MDBReader;

        beforeEach(() => {
            const buffer = readFileSync(filename);
            reader = new MDBReader(buffer);
        });

        it("should have no tables", () => {
            const tableNames = reader.getTableNames();
            expect(tableNames).toStrictEqual([]);
        });
    });
});
