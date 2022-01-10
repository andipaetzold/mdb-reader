import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../../src";

// TODO: test Jet 3 with password
describe.each`
    filename                       | password      | result
    ${"V1997_no-password.mdb"}     | ${null}       | ${null}
    ${"V2000_with-password.mdb"}   | ${"password"} | ${"password"}
    ${"V2000_no-password.mdb"}     | ${null}       | ${null}
    ${"V2003_with-password.mdb"}   | ${"password"} | ${"password"}
    ${"V2003_no-password.mdb"}     | ${null}       | ${null}
    ${"V2010_no-password.accdb"}   | ${null}       | ${null}
    ${"V2010_with-password.accdb"} | ${"password"} | ${"ꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣꎣ"}
`("$filename", ({ filename, password, result }) => {
    const path = resolve(__dirname, "data", filename);

    let reader: MDBReader;

    beforeEach(() => {
        const buffer = readFileSync(path);
        reader = new MDBReader(buffer, { password });
    });

    it("should read the password", () => {
        expect(reader.getPassword()).toBe(result);
    });
});
