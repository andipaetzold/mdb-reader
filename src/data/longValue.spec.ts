import { expect } from "chai";
import type { Column } from "../column.js";
import type { Database } from "../Database.js";
import { readOLE } from "./ole.js";
import { readMemo } from "./memo.js";

function header(length: number, pointer = 256): Buffer {
    const buffer = Buffer.alloc(12);
    buffer.writeUIntLE(length, 0, 3);
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
        function decode(length: number, rows: Map<number, Buffer>, pointer = 256): string {
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
            const result = (kind === "OLE" ? readOLE : readMemo)(header(length, pointer), {} as Column, database);
            return typeof result === "string" ? result : result.toString();
        }

        for (const [name, links, repeated] of [
            ["self-loop", [[256, 256]], 256],
            ["two-row cycle", [[256, 512], [512, 256]], 256],
            ["cycle after a prefix", [[256, 512], [512, 768], [768, 512]], 512],
        ] as const) {
            it(`rejects a ${name} before fetching a row twice`, () => {
                const rows = new Map(links.map(([pointer, next]) => [pointer, row(next)]));
                expect(() => decode(10, rows)).to.throw(`Cyclic ${kind} long-value chain at page-row ${repeated}`);
            });
        }

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
    });
}
