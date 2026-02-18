import { expect } from "chai";
import { readLong } from "./long.js";

describe("Long", () => {
    it("reads a 4-byte signed integer (little-endian)", () => {
        const value = 1234567890;
        const buffer = Buffer.alloc(4);
        buffer.writeInt32LE(value);

        const result = readLong(buffer, {} as never, {} as never);
        expect(result).to.equal(value);
    });
});