import { readDateTimeExtended } from "./datetimextended";

it("start date", () => {
    const buffer = Buffer.from("0000000000000000000:0000000000000000000:0000000");
    const result = readDateTimeExtended(buffer);
    console.log(result)
});
