import { expect } from "chai";
import type { Column } from "../column.js";
import type { Database } from "../Database.js";
import { readMemo } from "./memo.js";
import { readOLE } from "./ole.js";

function header(pointer: number, length = 100): Buffer {
    const buffer = Buffer.alloc(12);
    buffer.writeUIntLE(length, 0, 3);
    buffer.writeUInt32LE(pointer, 4);
    return buffer;
}

function row(next: number, text = "a"): Buffer {
    const buffer = Buffer.alloc(4 + text.length);
    buffer.writeUInt32LE(next, 0);
    buffer.write(text, 4, "ascii");
    return buffer;
}

function database(rows: Map<number, Buffer>): Database {
    let lookups = 0;
    return {
        format: { textEncoding: "unknown" },
        findPageRow(pointer: number): Buffer {
            if (++lookups > 20) {
                throw new Error("Lookup limit exceeded");
            }
            return rows.get(pointer)!;
        },
    } as unknown as Database;
}

for (const [name, read] of [["memo", readMemo], ["OLE", readOLE]] as const) {
    describe(`${name} chains`, () => {
        const column = {} as Column;
        for (const [label, rows, repeated] of [
            ["self-cycle with data", [[256, row(256)]], 256],
            ["two-row cycle", [[256, row(257)], [257, row(256)]], 256],
            ["prefix entering a cycle", [[256, row(257)], [257, row(258)], [258, row(257)]], 257],
            ["unsigned pointer cycle", [[0x80000100, row(0x80000100)]], 0x80000100],
        ] as const) {
            it(`rejects ${label}`, () => {
                expect(() => read(header(rows[0][0]), column, database(new Map(rows)))).to.throw(
                    `Corrupted ${name} chain: repeated page/row pointer ${repeated}`,
                );
            });
        }

        it("reads distinct rows on the same page and permits independent reads", () => {
            const db = database(new Map([[256, row(257, "a")], [257, row(0, "b")]]));
            for (let i = 0; i < 2; i++) {
                const result = read(header(256, 2), column, db);
                expect(Buffer.isBuffer(result) ? result.toString("ascii") : result).to.equal("ab");
            }
        });
    });
}

describe("pointer-only memo chains", () => {
    for (const next of [[256], [257, 256]]) {
        it(`rejects a ${next.length}-row cycle`, () => {
            const rows = new Map(next.map((pointer, i) => [256 + i, row(pointer, "")]));
            expect(() => readMemo(header(256), {} as Column, database(rows))).to.throw(
                "Corrupted memo chain: repeated page/row pointer 256",
            );
        });
    }
});

describe("short OLE rows", () => {
    for (const length of [0, 1, 2, 3, 4]) {
        it(`terminates on a ${length}-byte row`, () => {
            const db = database(new Map([[256, Buffer.alloc(length)]]));
            expect(readOLE(header(256), {} as Column, db)).to.deep.equal(Buffer.alloc(100));
        });
    }
});
