import { expect } from "chai";
import { readFileSync } from "fs";
import { resolve } from "path";
import MDBReader from "../src/index.js";

describe("LongText", () => {
    it("rejects a pointer-only cycle", () => {
        const buffer = readFileSync(resolve("test/data/V2016/longtext.accdb"));
        const page = 91 * 4096;
        buffer.writeUInt16LE(4092, page + 14);
        buffer.writeUInt32LE(91 << 8, page + 4092);
        const table = new MDBReader(buffer).getTable("Table1");
        expect(() => table.getData()).to.throw("Corrupted memo chain: repeated page/row pointer 23296");
    });

    it("multiple pages", () => {
        const path = resolve("test/data/V2016/longtext.accdb");
        const buffer = readFileSync(path);
        const reader = new MDBReader(buffer);
        const data = reader.getTable("Table1").getData();
        expect(data[0]!['LongText']).to.have.length(5000);
    });
});
