import { describe, it, expect, beforeEach } from "vitest";
import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../../src/node.js";

describe("Creation Date", () => {
    describe.each([
        ["V1997.mdb", null],
        ["V2000.mdb", "2022-01-07T16:20:28.023Z"],
        ["V2010.accdb", "2022-01-07T16:20:39.512Z"],
    ])("%s", (filename, date) => {
        let buffer: Buffer;

        beforeEach(() => {
            const path = resolve("test/creation-date/data", filename);
            buffer = readFileSync(path);
        });

        it("should read the creation date", () => {
            const reader = new MDBReader(buffer);
            const expected = date === null ? null : new Date(Date.parse(date));
            expect(reader.getCreationDate()).toEqual(expected);
        });
    });
});
