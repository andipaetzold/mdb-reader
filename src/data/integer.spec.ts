import { expect } from "chai";
import { readInteger } from "./integer.js";

describe("Integer", () => {
    it("can read integer", () => {
        const value = 1337;

        const buffer = Buffer.alloc(2);
        buffer.writeInt16LE(value);

        const result = readInteger(buffer);
        expect(result).to.eq(value);
    });
});
