import { describe, it, expect, beforeEach } from "vitest";
import { resolve } from "path";
import { readFileSync } from "fs";
import { readers } from "../readers.js";

describe.each(readers)("Password ($platform)", ({ MDBReader }) => {
    // TODO: test Jet 3 with password
    describe.each([
        ["V1997_no-password.mdb", null, null],
        ["V2000_with-password.mdb", "password", "password"],
        ["V2000_no-password.mdb", null, null],
        ["V2003_with-password.mdb", "password", "password"],
        ["V2003_no-password.mdb", null, null],
        ["V2010_no-password.accdb", null, null],
        ["V2010_with-password.accdb", "password", "ꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣ"],
    ])("%s", (filename, password, result) => {
        const path = resolve("test/password/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        it("should read the password", () => {
            const reader = new MDBReader(buffer, { password: password ?? undefined });
            expect(reader.getPassword()).toBe(result);
        });
    });
});
