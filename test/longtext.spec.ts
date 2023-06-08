import { expect } from "chai";
import { readFileSync } from "fs";
import { resolve } from "path";
import MDBReader from "../src/index.js";

describe("LongText", () => {
    it("multiple pages", () => {
        const path = resolve("test/data/V2016/longtext.accdb");
        const buffer = readFileSync(path);
        const reader = new MDBReader(buffer);
        const data = reader.getTable("Table1").getData();
        expect(data[0].LongText).to.have.length(5000);
    });
});
