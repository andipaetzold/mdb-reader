import { expect } from "chai";
import { readDouble } from "./double.js";

describe("Double", () => {
    it("can read double", () => {
        const value = 3.14159;

        const buffer = Buffer.alloc(8);
        buffer.writeDoubleLE(value);

        const result = readDouble(buffer);
        expect(result).to.eq(value);
    });
});
