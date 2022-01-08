import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../../src";

describe.each`
    filename         | date
    ${"V1997.mdb"}   | ${null}
    ${"V2000.mdb"}   | ${"2022-01-07T16:20:28.023Z"}
    ${"V2010.accdb"} | ${"2022-01-07T16:20:39.512Z"}
`("$filename", ({ filename, date }) => {
    const path = resolve(__dirname, "data", filename);

    let reader: MDBReader;

    beforeEach(() => {
        const buffer = readFileSync(path);
        reader = new MDBReader(buffer);
    });

    it("should read the creation date", () => {
        const expected = date === null ? null : new Date(Date.parse(date));
        expect(reader.getCreationDate()).toStrictEqual(expected);
    });
});
