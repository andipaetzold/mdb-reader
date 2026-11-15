import { expect } from "chai";
import { execFileSync } from "node:child_process";
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
        expect(data).to.have.length(11);
        const payload = data.find((entry) => entry["ID"] === 2)?.["ole_data"];
        expect(Buffer.isBuffer(payload)).to.equal(true);
        expect(payload).to.have.length(94602);
        expect(createHash("sha256").update(payload as Buffer).digest("hex"))
            .to.equal("334e3631b06b696ac63fe0dd484109c9f9e75cf58c3655e08ede032d557071dc");
    });

    it("propagates cyclic long-value errors through getData without hanging", function () {
        this.timeout(15000);
        const script = `
            import { readFileSync } from "node:fs";
            import { strict as assert } from "node:assert";
            import MDBReader from ${JSON.stringify(new URL("../src/index.js", import.meta.url).href)};
            const buffer = Buffer.from(readFileSync(${JSON.stringify(resolve("test/data/V2007/ole.accdb"))}));
            const rowOffset = buffer.readUInt16LE(136 * 4096 + 14);
            buffer.writeUInt32LE(136 * 256, 136 * 4096 + rowOffset);
            assert.throws(() => new MDBReader(buffer).getTable("Table1").getData(), {
                message: "Cyclic OLE long-value chain at page-row 34816"
            });
        `;
        execFileSync(process.execPath, [...process.execArgv, "--input-type=module", "-e", script], {
            timeout: 10000,
            env: process.env,
            stdio: "pipe",
        });
    });
});
