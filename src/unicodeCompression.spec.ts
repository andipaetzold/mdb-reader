import { uncompressText } from "./unicodeCompression";

const compressionHeader = Buffer.from([0xff, 0xfe]);

describe("uncompressText", () => {
    it("decodes Jet3 buffer", () => {
        const inputString = "This is a test";
        const inputBuffer = Buffer.from(inputString, "utf8");

        const result = uncompressText(inputBuffer, "Jet3");
        expect(result).toBe(inputString);
    });

    it("decodes uncompressed Jet4 buffer", () => {
        const inputString = "This is a test";
        const inputBuffer = Buffer.from(inputString, "ucs-2");

        const result = uncompressText(inputBuffer, "Jet4");
        expect(result).toBe(inputString);
    });

    it("decodes compressed ascii without uncompressed characters", () => {
        const inputString = "This is a test";
        const inputBuffer = Buffer.from(inputString, "ucs-2");
        const compressedInputBuffer = inputBuffer.filter((_byte, index) => index % 2 === 0);
        expect(compressedInputBuffer.length).toBe(inputBuffer.length / 2);

        const fullInputBuffer = Buffer.concat([compressionHeader, compressedInputBuffer]);

        const result = uncompressText(fullInputBuffer, "Jet4");
        expect(result).toBe(inputString);
    });

    it("decodes compressed ascii with uncompressed characters", () => {
        const asciiInputString = "ASCII";
        const asciiInputBuffer = Buffer.from(asciiInputString, "ucs-2");
        const asciiCompressedInputBuffer = asciiInputBuffer.filter((_byte, index) => index % 2 === 0);
        expect(asciiCompressedInputBuffer.length).toBe(asciiInputBuffer.length / 2);

        const unicodeInputString = "Ț✚";
        const unicodeInputBuffer = Buffer.from(unicodeInputString, "ucs-2");

        const fullInputBuffer = Buffer.concat([
            compressionHeader,
            asciiCompressedInputBuffer,
            Buffer.from([0x00]),
            unicodeInputBuffer,
            Buffer.from([0x00]),
            asciiCompressedInputBuffer,
        ]);

        const result = uncompressText(fullInputBuffer, "Jet4");
        expect(result).toBe(`${asciiInputString}${unicodeInputString}${asciiInputString}`);
    });
});
