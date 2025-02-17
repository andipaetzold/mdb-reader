import { expect } from "chai";
import { uncompressText } from "./unicodeCompression.js";

const compressionHeader = Buffer.from([0xff, 0xfe]);

describe("uncompressText", () => {
    it("decodes Jet3 buffer", () => {
        const inputString = "Série";
        const inputBuffer = Buffer.from([0x53, 0xe9, 0x72, 0x69, 0x65]);

        const result = uncompressText(inputBuffer, { textEncoding: "unknown" });
        expect(result).to.eq(inputString);
    });

    it("decodes uncompressed Jet4 buffer", () => {
        const inputString = "This is a test";
        const inputBuffer = Buffer.from(inputString, "ucs-2");

        const result = uncompressText(inputBuffer, { textEncoding: "ucs-2" });
        expect(result).to.eq(inputString);
    });

    describe("decodes compressed ascii", () => {
        it("without uncompressed characters", () => {
            const inputString = "This is a test";
            const inputBuffer = Buffer.from(inputString, "ucs-2");
            const compressedInputBuffer = inputBuffer.filter((_byte, index) => index % 2 === 0);
            expect(compressedInputBuffer.length).to.eq(inputBuffer.length / 2);

            const fullInputBuffer = Buffer.concat([compressionHeader, compressedInputBuffer]);

            const result = uncompressText(fullInputBuffer, { textEncoding: "ucs-2" });
            expect(result).to.eq(inputString);
        });

        it("with uncompressed characters", () => {
            const asciiInputString = "ASCII";
            const asciiInputBuffer = Buffer.from(asciiInputString, "ucs-2");
            const asciiCompressedInputBuffer = asciiInputBuffer.filter((_byte, index) => index % 2 === 0);
            expect(asciiCompressedInputBuffer.length).to.eq(asciiInputBuffer.length / 2);

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

            const result = uncompressText(fullInputBuffer, { textEncoding: "ucs-2" });
            expect(result).to.eq(`${asciiInputString}${unicodeInputString}${asciiInputString}`);
        });

        it("with an uncompressed character as last char", () => {
            const fullInputBuffer = Buffer.concat([
                compressionHeader,
                Buffer.from([0x00]),
                Buffer.from("Hello world", "ucs-2"),
            ]);
            const result = uncompressText(fullInputBuffer, { textEncoding: "ucs-2" });
            expect(result).to.eq("Hello world");
        });
    });
});
