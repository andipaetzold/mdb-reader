import { expect } from "chai";
import { readBinary } from "./binary.js";

describe("Binary", () => {
    it("can read binary", () => {
        const buffer = Buffer.from("HELLO", "ascii");

        const result = readBinary(buffer);
        expect(result).not.to.eq(buffer);
        expect(result).to.deep.eq(buffer);
    });
});
