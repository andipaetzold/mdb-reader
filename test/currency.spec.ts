import { describe, it, expect, beforeEach } from "vitest";
import { resolve } from "path";
import { readFileSync } from "fs";
import { readers } from "./readers.js";

describe.each(readers)("Currency ($platform)", ({ MDBReader }) => {
    describe.each([["V2016/currency.accdb"]])("%s", (filename) => {
        const path = resolve("test/data", filename);

        let buffer: Buffer;

        beforeEach(() => {
            buffer = readFileSync(path);
        });

        it("getData(): preserves negative currency data across repeated reads and readers", () => {
            const positivePattern = Buffer.from("a068060000000000", "hex");
            const matches: number[] = [];
            for (let offset = buffer.indexOf(positivePattern); offset !== -1;
                offset = buffer.indexOf(positivePattern, offset + 1)) {
                matches.push(offset);
            }
            expect(matches).toHaveLength(1);
            buffer.writeBigInt64LE(-420000n, matches[0]!);
            const snapshot = Buffer.from(buffer);

            const reader = new MDBReader(buffer);
            expect(buffer).toEqual(snapshot);
            const table = reader.getTable("Table");
            expect(table.getData()).toEqual([{ ID: 1, Money: "-42.0000" }]);
            expect(buffer).toEqual(snapshot);
            expect(table.getData()).toEqual([{ ID: 1, Money: "-42.0000" }]);
            expect(buffer).toEqual(snapshot);

            const secondReader = new MDBReader(buffer);
            expect(buffer).toEqual(snapshot);
            expect(secondReader.getTable("Table").getData()).toEqual([{ ID: 1, Money: "-42.0000" }]);
            expect(buffer).toEqual(snapshot);
        });

        it("getData(): returns correct currency data", () => {
            const reader = new MDBReader(buffer);
            const table = reader.getTable("Table");
            const rows = table.getData();

            expect(rows.length).toBe(1);

            const row = rows[0]!;
            expect(row['Money']).toBe("42.0000");
        });
    });
});
