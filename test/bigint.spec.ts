import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src";

describe.each`
    filename
    ${"V2016/bigint.accdb"}
`("$filename", ({ filename }) => {
    const path = resolve(__dirname, "data", filename);

    let reader: MDBReader;

    beforeEach(() => {
        const buffer = readFileSync(path);
        reader = new MDBReader(buffer);
    });

    /**
     * @see https://github.com/jahlborn/jackcess/blob/3f75e95a21d9a9e3486519511cdd6178e3c2e3e4/src/test/java/com/healthmarketscience/jackcess/DatabaseTest.java#L471-L516
     */
    it("getData(): returns correct big int data", () => {
        const table = reader.getTable("Table");
        const rows = table.getData();

        expect(rows.length).toBe(1);

        const row = rows[0];
        expect(row.Numeric).toBe(42n);
    });
});
