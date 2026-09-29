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

    it("handles corrupted or truncated memo pointers without throwing bounds error", () => {
        const path = resolve("test/data/V2016/longtext.accdb");
        const buffer = readFileSync(path);
        // Truncate the buffer so memo pointers point out of bounds
        const truncatedBuffer = buffer.subarray(0, Math.floor(buffer.length / 2));
        try {
            const reader = new MDBReader(truncatedBuffer);
            const tables = reader.getTableNames();
            if (tables.includes("Table1")) {
                const data = reader.getTable("Table1").getData();
                expect(Array.isArray(data)).to.be.true;
            }
        } catch (e: any) {
            // Should not crash with ERR_BUFFER_OUT_OF_BOUNDS / RangeError
            expect(e?.code).to.not.equal("ERR_BUFFER_OUT_OF_BOUNDS");
        }
    });
});
