import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src";

const files = [
    "V2000/empty.mdb",
    "V2003/empty.mdb",
    "V2007/empty.accdb",
    "V2010/empty.accdb",
    "V2016/empty.accdb",
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
