import { resolve } from "path";
import { readFileSync } from "fs";
import { createMDBReader } from "../../src/index.js";
import forEach from "mocha-each";
import { expect } from "chai";

describe("Encryption", () => {
    forEach([
        ["office-agile-4.4.accdb", "password"],
        ["office-agile-4.2.accdb", "password"],
    ]).describe("%s", (filename, password) => {
        const path = resolve("test/encryption/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        it("should be able to read a page", async function () {
            this.timeout(5000); // node 20 in CI is slow
            const reader = await createMDBReader(buffer, { password });
            expect(reader.getTableNames()).to.eventually.deep.eq(["Table1"]);
        });
    });

    forEach([["office-agile-4.4.accdb"], ["office-agile-4.2.accdb"]]).describe("%s", (filename) => {
        const path = resolve("test/encryption/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        it("should throw for wrong password", async () => {
            expect(() => createMDBReader(buffer, { password: "wrong-password" })).to.throw;
        });
    });
});
