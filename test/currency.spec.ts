import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src/index.js";
import forEach from "mocha-each";
import { expect } from "chai";

describe("Currency", () => {
    forEach([["V2016/currency.accdb"]]).describe("%s", (filename) => {
        const path = resolve("test/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        it("getData(): returns correct currency data", () => {
            const reader = new MDBReader(buffer);
            const table = reader.getTable("Table");
            const rows = table.getData();

            expect(rows.length).to.eq(1);

            const row = rows[0]!;
            expect(row['Money']).to.eq("42.0000");
        });
    });
});
