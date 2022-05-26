import { expect } from "chai";
import { readFloat } from "./float.js";

describe("Float", () => {
    it("can read float", () => {
        const value = 3.14159;

        const buffer = Buffer.alloc(4);
        buffer.writeFloatLE(value);

        const result = readFloat(buffer);
        expect(result).to.be.greaterThanOrEqual(value);
        expect(result).to.be.lessThan(value + 0.00001);
    });
});
