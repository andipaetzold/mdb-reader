import { readByte } from "./byte";

it("can read byte", () => {
    const value = 42;

    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(value);

    const result = readByte(buffer);
    expect(result).toBe(value);
});
