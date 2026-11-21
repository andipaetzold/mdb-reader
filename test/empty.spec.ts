import { describe, it, expect, beforeEach } from "vitest";
import { resolve } from "path";
import { readFileSync } from "fs";
import { readers } from "./readers.js";

const files = ["V2000/empty.mdb", "V2003/empty.mdb", "V2007/empty.accdb", "V2010/empty.accdb", "V2016/empty.accdb"];

describe.each(readers)("empty ($platform)", ({ MDBReader }) => {
    files.forEach((file) => {
        describe(file, () => {
            const filename = resolve("test/data", file);

            let buffer: Buffer;

            beforeEach(() => {
                buffer = readFileSync(filename);
            });

            it("should have no tables", () => {
                const reader = new MDBReader(buffer);
                const tableNames = reader.getTableNames();
                expect(tableNames).toEqual([]);
            });
        });
    });
});
