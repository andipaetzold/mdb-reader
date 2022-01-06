import { roundToFullByte, getBitmapValue, xor } from "./util";

it("getBitmapValue", () => {
    const buffer = Buffer.from([parseInt("10101010", 2), parseInt("01010101", 2)]);

    expect(getBitmapValue(buffer, 0)).toBeFalsy();
    expect(getBitmapValue(buffer, 1)).toBeTruthy();
    expect(getBitmapValue(buffer, 7)).toBeTruthy();
    expect(getBitmapValue(buffer, 8)).toBeTruthy();
    expect(getBitmapValue(buffer, 9)).toBeFalsy();
});

it("roundToFullByte", () => {
    expect(roundToFullByte(0)).toBe(0);
    expect(roundToFullByte(1)).toBe(1);
    expect(roundToFullByte(2)).toBe(1);
    expect(roundToFullByte(3)).toBe(1);
    expect(roundToFullByte(8)).toBe(1);
    expect(roundToFullByte(9)).toBe(2);
});

it("xor", () => {
    // https://github.com/crypto-browserify/buffer-xor/blob/master/test/fixtures.json
    expect(xor(Buffer.from([0x00, 0x0f]), Buffer.from([0xf0, 0xff]))).toStrictEqual(Buffer.from([0xf0, 0xf0]));
    expect(xor(Buffer.from([0x00, 0x0f, 0x0f]), Buffer.from([0xf0, 0xff]))).toStrictEqual(Buffer.from([0xf0, 0xf0, 0x0f]));
    expect(xor(Buffer.from([0x00, 0x0f]), Buffer.from([0xf0, 0xff, 0xff]))).toStrictEqual(Buffer.from([0xf0, 0xf0, 0xff]));
    expect(xor(Buffer.from([0x00, 0x00, 0x00]), Buffer.from([0x00, 0x00, 0x00]))).toStrictEqual(
        Buffer.from([0x00, 0x00, 0x00])
    );
});
