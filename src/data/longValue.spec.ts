import { expect } from "chai";
import type { Column } from "../column.js";
import type { Database } from "../Database.js";
import { readOLE } from "./ole.js";
import { readMemo } from "./memo.js";

function header(length: number, pointer = 256, type = 0): Buffer {
    const buffer = Buffer.alloc(12);
    buffer.writeUIntLE(length, 0, 3);
    buffer[3] = type;
    buffer.writeUInt32LE(pointer, 4);
    return buffer;
}

function row(next: number, payload = "ab"): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32LE(next);
    return Buffer.concat([buffer, Buffer.from(payload)]);
}

for (const kind of ["OLE", "Memo"] as const) {
    describe(`${kind} long-value chains`, () => {
        function decode(length: number, rows: Map<number, Buffer>, pointer = 256, type = 0): string {
            let lookups = 0;
            const database = {
                format: { textEncoding: "unknown" },
                findPageRow(pageRow: number): Buffer {
                    if (++lookups > rows.size) {
                        throw new Error("Lookup limit exceeded");
                    }
                    const buffer = rows.get(pageRow);
                    if (!buffer) {
                        throw new Error(`Unexpected lookup ${pageRow}`);
                    }
                    return buffer;
                },
            } as unknown as Database;
            const result = (kind === "OLE" ? readOLE : readMemo)(header(length, pointer, type), {} as Column, database);
            return typeof result === "string" ? result : result.toString();
        }

        it("rejects a self-loop before fetching a row twice", () => {
            expect(() => decode(10, new Map([[256, row(256)]])))
                .to.throw(`Cyclic ${kind} long-value chain at page-row 256`);
        });

        it("rejects a two-row cycle", () => {
            expect(() => decode(10, new Map([[256, row(512)], [512, row(256)]])))
                .to.throw(`Cyclic ${kind} long-value chain at page-row 256`);
        });

        it("rejects a cycle after a valid prefix", () => {
            expect(() => decode(10, new Map([[256, row(512)], [512, row(768)], [768, row(512)]])))
                .to.throw(`Cyclic ${kind} long-value chain at page-row 512`);
        });

        for (const length of [0, 1, 2, 3, 4]) {
            it(`rejects a row of ${length} bytes without payload`, () => {
                expect(() => decode(10, new Map([[256, Buffer.alloc(length)]])))
                    .to.throw(`Invalid ${kind} long-value row: no payload`);
            });
        }

        it("returns an empty value without lookups", () => {
            expect(decode(0, new Map())).to.equal("");
        });

        it("preserves early null termination", () => {
            expect(decode(4, new Map([[256, row(0)]]))).to.equal(kind === "OLE" ? "ab\0\0" : "ab");
        });

        for (const trailing of [256, 999]) {
            it(`ignores trailing pointer ${trailing} after exact completion`, () => {
                expect(decode(4, new Map([[256, row(257)], [257, row(trailing, "cd")]]))).to.equal("abcd");
            });
        }

        it("reads distinct rows on the same page", () => {
            expect(decode(6, new Map([[256, row(257)], [257, row(258, "cd")], [258, row(0, "ef")]])))
                .to.equal("abcdef");
        });

        it("reads initial and continuation pointers as unsigned", () => {
            expect(decode(4, new Map([[0x80000100, row(0x80000101)], [0x80000101, row(0, "cd")]]), 0x80000100))
                .to.equal("abcd");
        });

        it("preserves final chunk overflow handling", () => {
            expect(decode(3, new Map([[256, row(257)], [257, row(999, "cd")]])))
                .to.equal(kind === "OLE" ? "abc" : "ab");
        });

        it("preserves inline values without lookups", () => {
            const database = {
                format: { textEncoding: "unknown" },
                findPageRow(): never { throw new Error("Unexpected lookup"); },
            } as unknown as Database;
            const result = (kind === "OLE" ? readOLE : readMemo)(
                Buffer.concat([header(2, 0, 0x80), Buffer.from("abcd")]), {} as Column, database
            );
            expect(typeof result === "string" ? result : result.toString()).to.equal("ab");
        });

        it("preserves malformed-header errors", () => {
            expect(() => decode(2, new Map(), 256, 0x20))
                .to.throw(kind === "OLE" ? "Unknown OLE type 32" : "Unknown memo type 32");
            expect(() => (kind === "OLE" ? readOLE : readMemo)(Buffer.alloc(2), {} as Column, {} as Database))
                .to.throw(RangeError);
        });

        it("preserves single-page values", () => {
            expect(decode(2, new Map([[256, Buffer.from("abcd")]]), 256, 0x40)).to.equal("ab");
        });
    });
}
