import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../../src/index.js";
import forEach from "mocha-each";
import { expect } from "chai";

describe("Creation Date", () => {
    forEach([
        ["V1997.mdb", null],
        ["V2000.mdb", "2022-01-07T16:20:28.023Z"],
        ["V2010.accdb", "2022-01-07T16:20:39.512Z"],
    ]).describe("%s", (filename, date) => {
        const path = resolve("test/creation-date/data", filename);

        let reader: MDBReader;

        beforeEach(() => {
            const buffer = readFileSync(path);
            reader = new MDBReader(buffer);
        });

        it("should read the creation date", () => {
            const expected = date === null ? null : new Date(Date.parse(date));
            expect(reader.getCreationDate()).to.deep.eq(expected);
        });
    });
});
