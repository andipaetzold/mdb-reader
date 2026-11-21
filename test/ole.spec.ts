import { describe, it, expect, beforeEach } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "fs";
import MDBReader from "../src/index.js";
import { resolve } from "path";

describe("OLE", () => {
    let buffer: Buffer;

    beforeEach(() => {
        const path = resolve("test/data", "V2007", "ole.accdb");
        buffer = readFileSync(path);
    });

    it("reads complete ole data", () => {
        const reader = new MDBReader(buffer);
        const data = reader.getTable("Table1").getData();
        expect(data).toHaveLength(11);
        const payload = data.find((entry) => entry["ID"] === 2)?.["ole_data"];
        expect(Buffer.isBuffer(payload)).toBe(true);
        expect(payload).toHaveLength(94602);
        expect(createHash("sha256").update(payload as Buffer).digest("hex"))
            .toBe("334e3631b06b696ac63fe0dd484109c9f9e75cf58c3655e08ede032d557071dc");
    });

    it("rejects cyclic OLE data through getData", () => {
        const rowOffset = buffer.readUInt16LE(136 * 4096 + 14);
        buffer.writeUInt32LE(136 * 256, 136 * 4096 + rowOffset);

        expect(() => new MDBReader(buffer).getTable("Table1").getData())
            .toThrow("Cyclic OLE long-value chain at page-row 34816");
    });
});
