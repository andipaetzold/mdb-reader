import { expect } from "chai";
import { readComplex } from "./complex.js";

describe("Complex", () => {
    it("can read coomplex", () => {
        const value = 1234567890;

        const buffer = Buffer.alloc(4);
        buffer.writeInt32LE(value);

        const result = readComplex(buffer);
        expect(result).to.eq(value);
    });
});
