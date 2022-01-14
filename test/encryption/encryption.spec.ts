import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../../src";

describe.each`
    filename                    | password
    ${"office-agile-4.4.accdb"} | ${"password"}
    ${"office-agile-4.2.accdb"} | ${"password"}
`("$filename", ({ filename, password }) => {
    const path = resolve(__dirname, "data", filename);

    let reader: MDBReader;

    beforeEach(() => {
        const buffer = readFileSync(path);
        reader = new MDBReader(buffer, { password });
    });

    it("should be able to read a page", () => {
        expect(reader.getTableNames()).toStrictEqual(["Table1"]);
    });
});

describe.each`
    filename
    ${"office-agile-4.4.accdb"}
    ${"office-agile-4.2.accdb"}
`("$filename", ({ filename }) => {
    const path = resolve(__dirname, "data", filename);

    let buffer: Buffer;

    beforeEach(() => {
        buffer = readFileSync(path);
    });

    it("should throw for wrong password", () => {
        expect(() => new MDBReader(buffer, { password: "wrong-password" })).toThrowError();
    });
});
