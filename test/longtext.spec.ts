import { expect } from "chai";
import { readFileSync } from "fs";
import { resolve } from "path";
import MDBReader from "../src/index.js";

describe("LongText", () => {
    it("multiple pages", () => {
        const path = resolve("test/data/V2016/longtext.accdb");
        const buffer = readFileSync(path);
        const reader = new MDBReader(buffer);
        const data = reader.getTable("Table1").getData();
        expect(data[0]!['LongText']).to.have.length(5000);
    });

    it("throws error for corrupted or truncated memo pointers by default", () => {
        const path = resolve("test/data/V2016/longtext.accdb");
        const buffer = Buffer.from(readFileSync(path));
        const corruptedBuffer = Buffer.from(buffer);
        // Page 91 contains part of the chained memo pointer data
        corruptedBuffer.fill(0, 91 * 4096 + 8, 92 * 4096);
        const reader = new MDBReader(corruptedBuffer);
        expect(() => {
            reader.getTable("Table1").getData();
        }).to.throw();
    });

    it("falls back to empty string for corrupted memo pointers when ignoreCorruptValues is true", () => {
        const path = resolve("test/data/V2016/longtext.accdb");
        const buffer = Buffer.from(readFileSync(path));
        const corruptedBuffer = Buffer.from(buffer);
        corruptedBuffer.fill(0, 91 * 4096 + 8, 92 * 4096);
        const reader = new MDBReader(corruptedBuffer);
        const data = reader.getTable("Table1").getData({ ignoreCorruptValues: true });
        expect(Array.isArray(data)).to.be.true;
    });
});
