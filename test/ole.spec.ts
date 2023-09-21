import { readFileSync } from "fs";
import MDBReader from "../src/index.js";
import { resolve } from "path";

describe("OLE", () => {
    let buffer: Buffer;

    beforeEach(() => {
        const path = resolve("test/data", "V2007", "ole.accdb");
        buffer = readFileSync(path);
    });

    it("reads ole data ", async () => {
        const reader = new MDBReader(buffer);
        const table = await reader.getTable("Table1");
        await table.getData();
        // TODO: check for correct values
    });
});
