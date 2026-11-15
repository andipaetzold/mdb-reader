import { execFile } from "child_process";
import { promisify } from "util";
import { expect } from "chai";
import { readFileSync } from "fs";
import { resolve } from "path";
import MDBReader from "../src/index.js";

describe("LongText", () => {
    it("rejects the issue #422 pointer-only cycle", async function () {
        this.timeout(15_000);
        const script = `
            import { readFileSync } from "fs";
            import MDBReader from "./src/index.js";
            const buffer = readFileSync("test/data/V2016/longtext.accdb");
            const page = 91 * 4096;
            buffer.writeUInt16LE(4092, page + 14);
            buffer.writeUInt32LE(91 << 8, page + 4092);
            try {
                new MDBReader(buffer).getTable("Table1").getData();
                throw new Error("Expected corrupted memo chain to fail");
            } catch (error) {
                if (error.message !== "Corrupted memo chain: repeated page/row pointer 23296") {
                    throw error;
                }
                console.log(error.message);
            }
        `;
        const { stdout } = await promisify(execFile)(process.execPath,
            ["--loader", "ts-node/esm", "--input-type=module", "-e", script],
            { timeout: 10_000, killSignal: "SIGKILL" },
        );
        expect(stdout.trim()).to.equal("Corrupted memo chain: repeated page/row pointer 23296");
    });

    it("multiple pages", () => {
        const path = resolve("test/data/V2016/longtext.accdb");
        const buffer = readFileSync(path);
        const reader = new MDBReader(buffer);
        const data = reader.getTable("Table1").getData();
        expect(data[0]!['LongText']).to.have.length(5000);
    });
});
