import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src";

describe.each`
    filename
    ${"V2000/numeric.mdb"}
    ${"V2003/numeric.mdb"}
    ${"V2007/numeric.accdb"}
    ${"V2010/numeric.accdb"}
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
    it("getData(): returns correct numeric data", () => {
        const table = reader.getTable("test");
        const rows = table.getData();

        expect(rows.length).toBe(1);

        const row = rows[0];
        expect(row.col2).toBe("1");
        expect(row.col3).toBe("0");
        expect(row.col4).toBe("0");
        expect(row.col5).toBe("4");
        expect(row.col6).toBe("-1");
        expect(row.col7).toBe("1");
    });
});
