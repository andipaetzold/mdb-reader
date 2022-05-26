import { expect } from "chai";
import { getBitmapValue, isEmptyBuffer, roundToFullByte, xor } from "./util.js";

describe("util", () => {
    it("getBitmapValue", () => {
        const buffer = Buffer.from([parseInt("10101010", 2), parseInt("01010101", 2)]);

        expect(getBitmapValue(buffer, 0)).to.not.be.ok;
        expect(getBitmapValue(buffer, 1)).to.be.ok;
        expect(getBitmapValue(buffer, 7)).to.be.ok;
        expect(getBitmapValue(buffer, 8)).to.be.ok;
        expect(getBitmapValue(buffer, 9)).to.not.be.ok;
    });

    it("roundToFullByte", () => {
        expect(roundToFullByte(0)).to.eq(0);
        expect(roundToFullByte(1)).to.eq(1);
        expect(roundToFullByte(2)).to.eq(1);
        expect(roundToFullByte(3)).to.eq(1);
        expect(roundToFullByte(8)).to.eq(1);
        expect(roundToFullByte(9)).to.eq(2);
    });

    it("xor", () => {
        // https://github.com/crypto-browserify/buffer-xor/blob/master/test/fixtures.json
        expect(xor(Buffer.from([0x00, 0x0f]), Buffer.from([0xf0, 0xff]))).to.deep.eq(Buffer.from([0xf0, 0xf0]));
        expect(xor(Buffer.from([0x00, 0x0f, 0x0f]), Buffer.from([0xf0, 0xff]))).to.deep.eq(Buffer.from([0xf0, 0xf0, 0x0f]));
        expect(xor(Buffer.from([0x00, 0x0f]), Buffer.from([0xf0, 0xff, 0xff]))).to.deep.eq(Buffer.from([0xf0, 0xf0, 0xff]));
        expect(xor(Buffer.from([0x00, 0x00, 0x00]), Buffer.from([0x00, 0x00, 0x00]))).to.deep.eq(
            Buffer.from([0x00, 0x00, 0x00])
        );
    });

    it("isEmptyBuffer", () => {
        expect(isEmptyBuffer(Buffer.alloc(4))).to.eq(true);
        expect(isEmptyBuffer(Buffer.alloc(0))).to.eq(true);
        expect(isEmptyBuffer(Buffer.from([0, 0, 0, 0]))).to.eq(true);
        expect(isEmptyBuffer(Buffer.from([0, 0, 1, 0]))).to.eq(false);
    });
});
