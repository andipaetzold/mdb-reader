import { expect } from "chai";
import { readCurrency } from "./currency.js";

describe("readCurrency", () => {
    const cases: ReadonlyArray<readonly [bigint, string]> = [
        [0n, "0.0000"],
        [420000n, "42.0000"],
        [-420000n, "-42.0000"],
        [-1n, "-0.0001"],
        [-256n, "-0.0256"],
        [-(1n << 63n), "-922337203685477.5808"],
        [(1n << 63n) - 1n, "922337203685477.5807"],
    ];

    for (const [scaledValue, expected] of cases) {
        it(`reads ${expected} repeatedly without changing the input`, () => {
            const buffer = Buffer.alloc(8);
            buffer.writeBigInt64LE(scaledValue);
            const snapshot = Buffer.from(buffer);

            expect(readCurrency(buffer)).to.eq(expected);
            expect(buffer).to.deep.eq(snapshot);
            expect(readCurrency(buffer)).to.eq(expected);
            expect(buffer).to.deep.eq(snapshot);
        });
    }

    it("preserves the entire parent buffer when reading a subarray", () => {
        const parent = Buffer.alloc(24, 0xa5);
        parent.writeBigInt64LE(-420000n, 5);
        const buffer = parent.subarray(5, 13);
        const snapshot = Buffer.from(parent);

        expect(readCurrency(buffer)).to.eq("-42.0000");
        expect(parent).to.deep.eq(snapshot);
        expect(readCurrency(buffer)).to.eq("-42.0000");
        expect(parent).to.deep.eq(snapshot);
    });
});
