import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src/index.js";
import forEach from "mocha-each";
import { expect } from "chai";

describe("Numeric", () => {
    forEach([["V2000/numeric.mdb"], ["V2003/numeric.mdb"], ["V2007/numeric.accdb"], ["V2010/numeric.accdb"]]).describe(
        "%s",
        (filename) => {
            const path = resolve("test/data", filename);

            let buffer: Buffer

            beforeEach(() => {
                buffer = readFileSync(path);
            });
            
            /**
             * @see https://github.com/jahlborn/jackcess/blob/3f75e95a21d9a9e3486519511cdd6178e3c2e3e4/src/test/java/com/healthmarketscience/jackcess/DatabaseTest.java#L471-L516
            */
           it("getData(): returns correct numeric data", () => {
                const reader = new MDBReader(buffer);
                const table = reader.getTable("test");
                const rows = table.getData();

                expect(rows.length).to.eq(1);

                const row = rows[0];
                expect(row.col2).to.eq("1");
                expect(row.col3).to.eq("0");
                expect(row.col4).to.eq("0");
                expect(row.col5).to.eq("4");
                expect(row.col6).to.eq("-1");
                expect(row.col7).to.eq("1");
            });
        }
    );
});
