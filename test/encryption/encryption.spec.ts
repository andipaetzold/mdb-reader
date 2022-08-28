import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../../src/index.js";
import forEach from "mocha-each";
import { expect } from "chai";

describe("Encryption", () => {
    forEach([
        ["office-agile-4.4.accdb", "password"],
        ["office-agile-4.2.accdb", "password"],
    ]).describe("%s", (filename, password) => {
        const path = resolve("test/encryption/data", filename);

        let reader: MDBReader;

        beforeEach(() => {
            const buffer = readFileSync(path);
            reader = new MDBReader(buffer, { password });
        });

        it("should be able to read a page", () => {
            expect(reader.getTableNames()).to.deep.eq(["Table1"]);
        });
    });

    forEach([["office-agile-4.4.accdb"], ["office-agile-4.2.accdb"]]).describe("%s", (filename) => {
        const path = resolve("test/encryption/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        it("should throw for wrong password", () => {
            expect(() => new MDBReader(buffer, { password: "wrong-password" })).to.throw;
        });
    });
});
