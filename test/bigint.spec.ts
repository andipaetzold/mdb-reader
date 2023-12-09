import { resolve } from "path";
import { readFileSync } from "fs";
import { createMDBReader } from "../src/index.js";
import forEach from "mocha-each";
import { expect } from "chai";

describe("BigInt", () => {
    forEach([["V2016/bigint.accdb"]]).describe("%s", (filename) => {
        const path = resolve("test/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        /**
         * @see https://github.com/jahlborn/jackcess/blob/3f75e95a21d9a9e3486519511cdd6178e3c2e3e4/src/test/java/com/healthmarketscience/jackcess/DatabaseTest.java#L471-L516
         */
        it("getData(): returns correct big int data", async () => {
            const reader = await createMDBReader(buffer);
            const table = await reader.getTable("Table");
            const rows = await table.getData();

            expect(rows.length).to.eq(1);

            const row = rows[0]!;
            expect(row["Numeric"]).to.eq(42n);
        });
    });
});
