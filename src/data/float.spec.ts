import { readFloat } from "./float";

it("can read float", () => {
    const value = 3.14159;

    const buffer = Buffer.alloc(4);
    buffer.writeFloatLE(value);

    const result = readFloat(buffer);
    expect(result).toBeGreaterThanOrEqual(value);
    expect(result).toBeLessThan(value + 0.00001);
});
