import { describe, it, expect } from "vitest";
import { readBinary } from "./binary.js";

describe("Binary", () => {
    it("can read binary", () => {
        const buffer = Buffer.from("HELLO", "ascii");

        const result = readBinary(buffer);
        expect(result).not.toBe(buffer);
        expect(result).toEqual(buffer);
    });
});
