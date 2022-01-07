import { readDouble } from "./double";

it("can read double", () => {
    const value = 3.14159;

    const buffer = Buffer.alloc(8);
    buffer.writeDoubleLE(value);

    const result = readDouble(buffer);
    expect(result).toBe(value);
});
