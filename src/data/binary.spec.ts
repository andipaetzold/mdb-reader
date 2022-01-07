import { readBinary } from "./binary";

it("can read binary", () => {
    const buffer = Buffer.from("HELLO", "ascii");

    const result = readBinary(buffer);
    expect(result).not.toBe(buffer);
    expect(result).toStrictEqual(buffer);
});
