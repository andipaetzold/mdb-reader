import { readDateTimeExtended } from "./datetimextended.js";
import forEach from "mocha-each";
import { expect } from "chai";

describe("DateTimeExtended", () => {
    forEach([
        ["0000000000000000000:0000000000000000000:7 ", "0001.01.01 00:00:00.000000000"],
        ["0000000000000365240:0000000452967891234:7 ", "1000.12.30 12:34:56.789123400"],
        ["0000000000000738153:0000000452967891234:7 ", "2021.12.30 12:34:56.789123400"],
        ["0000000000003287180:0000000452967891234:7 ", "9000.12.30 12:34:56.789123400"],
    ]).describe("can read %s", (buffer: string, date: string) => {
        expect(buffer).to.have.length(42);

        const result = readDateTimeExtended(Buffer.from(buffer));
        expect(result).to.eq(date);
    });
});
