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

        it("getData(): preserves negative currency data across repeated reads and readers", () => {
            const positivePattern = Buffer.from("a068060000000000", "hex");
            const matches: number[] = [];
            for (let offset = buffer.indexOf(positivePattern); offset !== -1;
                offset = buffer.indexOf(positivePattern, offset + 1)) {
                matches.push(offset);
            }
            expect(matches).to.have.lengthOf(1);
            buffer.writeBigInt64LE(-420000n, matches[0]!);
            const snapshot = Buffer.from(buffer);

            const reader = new MDBReader(buffer);
            expect(buffer).to.deep.eq(snapshot);
            const table = reader.getTable("Table");
            expect(table.getData()).to.deep.eq([{ ID: 1, Money: "-42.0000" }]);
            expect(buffer).to.deep.eq(snapshot);
            expect(table.getData()).to.deep.eq([{ ID: 1, Money: "-42.0000" }]);
            expect(buffer).to.deep.eq(snapshot);

            const secondReader = new MDBReader(buffer);
            expect(buffer).to.deep.eq(snapshot);
            expect(secondReader.getTable("Table").getData()).to.deep.eq([{ ID: 1, Money: "-42.0000" }]);
            expect(buffer).to.deep.eq(snapshot);
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
