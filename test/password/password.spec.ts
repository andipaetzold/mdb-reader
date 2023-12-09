import { resolve } from "path";
import { readFileSync } from "fs";
import { createMDBReader } from "../../src/index.js";
import { expect } from "chai";
import forEach from "mocha-each";

describe("Password", () => {
    // TODO: test Jet 3 with password
    forEach([
        ["V1997_no-password.mdb", null, null],
        ["V2000_with-password.mdb", "password", "password"],
        ["V2000_no-password.mdb", null, null],
        ["V2003_with-password.mdb", "password", "password"],
        ["V2003_no-password.mdb", null, null],
        ["V2010_no-password.accdb", null, null],
        ["V2010_with-password.accdb", "password", "ꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣ"],
    ]).describe("%s", (filename, password, result) => {
        const path = resolve("test/password/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        it("should read the password", async function () {
            this.timeout(5000); // node 20 in CI is slow
            const reader = await createMDBReader(buffer, { password });
            expect(reader.getPassword()).to.eq(result);
        });
    });
});
