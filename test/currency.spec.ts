import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src";

describe.each`
    filename
    ${"V2016/currency.accdb"}
`("$filename", ({ filename }) => {
    const path = resolve(__dirname, "data", filename);

    let reader: MDBReader;

    beforeEach(() => {
        const buffer = readFileSync(path);
        reader = new MDBReader(buffer);
    });

    it("getData(): returns correct currency data", () => {
        const table = reader.getTable("Table");
        const rows = table.getData();

        expect(rows.length).toBe(1);

        const row = rows[0];
        expect(row.Money).toBe("42.0000");
    });
});
