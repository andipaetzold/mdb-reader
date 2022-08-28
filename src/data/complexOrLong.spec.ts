import { expect } from "chai";
import { readComplexOrLong } from "./complexOrLong.js";

describe("Complex Or Long", () => {
    it("can read coomplex or long", () => {
        const value = 1234567890;

        const buffer = Buffer.alloc(4);
        buffer.writeInt32LE(value);

        const result = readComplexOrLong(buffer);
        expect(result).to.eq(value);
    });
});
