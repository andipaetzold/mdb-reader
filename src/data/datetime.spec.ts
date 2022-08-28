import { expect } from "chai";
import { readDateTime } from "./datetime.js";

describe("DateTime", () => {
    it("without milliseconds", () => {
        const buffer = Buffer.alloc(8);
        buffer.writeDoubleLE(32234.51375);
        expect(readDateTime(buffer).toISOString()).to.eq(`1988-04-01T12:19:48.000Z`);
    });

    it("with milliseconds", () => {
        const buffer = Buffer.alloc(8);
        buffer.writeDoubleLE(32234.513755787);
        expect(readDateTime(buffer).toISOString()).to.eq(`1988-04-01T12:19:48.500Z`);
    });
});
