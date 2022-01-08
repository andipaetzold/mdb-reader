import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../../src";

// TODO: test Jet 3
// TODO: add V2010_with-password.accdb once decryption works
describe.each`
    filename                     | password
    ${"V2000_with-password.mdb"} | ${"password"}
    ${"V2000_no-password.mdb"}   | ${null}
    ${"V2003_with-password.mdb"} | ${"password"}
    ${"V2003_no-password.mdb"}   | ${null}
    ${"V2010_no-password.accdb"} | ${null}
`("$filename", ({ filename, password }) => {
    const path = resolve(__dirname, "data", filename);

    let reader: MDBReader;

    beforeEach(() => {
        const buffer = readFileSync(path);
        reader = new MDBReader(buffer);
    });

    it("should read the password", () => {
        expect(reader.getPassword()).toBe(password);
    });
});
