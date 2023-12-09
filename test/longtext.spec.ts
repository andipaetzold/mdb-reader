import { expect } from "chai";
import { readFileSync } from "fs";
import { resolve } from "path";
import { createMDBReader } from "../src/index.js";

describe("LongText", () => {
    it("multiple pages", async () => {
        const path = resolve("test/data/V2016/longtext.accdb");
        const buffer = readFileSync(path);
        const reader = await createMDBReader(buffer);
        const table = await reader.getTable("Table1");
        const data = await table.getData();
        expect(data[0]!['LongText']).to.have.length(5000);
    });
});
