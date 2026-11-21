import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { readers } from "./readers.js";

describe.each(readers)("LongText ($platform)", ({ MDBReader }) => {
    it("rejects a pointer-only cycle", () => {
        const buffer = readFileSync(resolve("test/data/V2016/longtext.accdb"));
        const page = 91 * 4096;
        buffer.writeUInt16LE(4092, page + 14);
        buffer.writeUInt32LE(91 << 8, page + 4092);
        const table = new MDBReader(buffer).getTable("Table1");
        expect(() => table.getData()).toThrow("Invalid Memo long-value row: no payload");
    });

    it("multiple pages", () => {
        const path = resolve("test/data/V2016/longtext.accdb");
        const buffer = readFileSync(path);
        const reader = new MDBReader(buffer);
        const data = reader.getTable("Table1").getData();
        expect(data[0]!['LongText']).toHaveLength(5000);
    });
});
