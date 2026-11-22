import { describe, it, expect, beforeEach } from "vitest";
import { resolve } from "path";
import { readFileSync } from "fs";
import { readers } from "../readers.js";

describe.each(readers)("Encryption ($platform)", ({ MDBReader }) => {
    describe.each([
        ["office-agile-4.4.accdb", "password"],
        ["office-agile-4.2.accdb", "password"],
    ])("%s", (filename, password) => {
        const path = resolve("test/encryption/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        it("should be able to read a page", () => {
            const reader = new MDBReader(buffer, { password });
            expect(reader.getTableNames()).toEqual(["Table1"]);
        });
    });

    describe.each([["office-agile-4.4.accdb"], ["office-agile-4.2.accdb"]])("%s", (filename) => {
        const path = resolve("test/encryption/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        it("should throw for wrong password", () => {
            expect(() => new MDBReader(buffer, { password: "wrong-password" })).toThrow("Wrong password");
        });
    });
});
