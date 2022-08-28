import { decryptRC4 } from "./rc4.js";
import forEach from "mocha-each";
import { expect } from "chai";

describe("RC4", () => {
    describe("decryptRC4", () => {
        // https://en.wikipedia.org/wiki/RC4#Test_vectors
        forEach([
            ["Key", Buffer.from([0xbb, 0xf3, 0x16, 0xe8, 0xd9, 0x40, 0xaf, 0x0a, 0xd3]), "Plaintext"],
            ["Wiki", Buffer.from([0x10, 0x21, 0xbf, 0x04, 0x20]), "pedia"],
            [
                "Secret",
                Buffer.from([0x45, 0xa0, 0x1f, 0x64, 0x5f, 0xc3, 0x5b, 0x38, 0x35, 0x52, 0x54, 0x4b, 0x9b, 0xf5]),
                "Attack at dawn",
            ],
        ]).it("%s", (key, encrypted, expected) => {
            const result = decryptRC4(Buffer.from(key, "ascii"), encrypted);
            expect(result.toString("ascii")).to.eq(expected);
        });
    });
});
