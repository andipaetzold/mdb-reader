import { readComplexOrLong } from "./complexOrLong";

it("can read coomplex or long", () => {
    const value = 1234567890;

    const buffer = Buffer.alloc(4);
    buffer.writeInt32LE(value);

    const result = readComplexOrLong(buffer);
    expect(result).toBe(value);
});
