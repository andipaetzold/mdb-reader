import { readDateTimeExtended } from "./datetimextended";

it.each`
    buffer                                          | date
    ${"0000000000000000000:0000000000000000000:7 "} | ${"0001.01.01 00:00:00.000000000"}
    ${"0000000000000365240:0000000452967891234:7 "} | ${"1000.12.30 12:34:56.789123400"}
    ${"0000000000000738153:0000000452967891234:7 "} | ${"2021.12.30 12:34:56.789123400"}
    ${"0000000000003287180:0000000452967891234:7 "} | ${"9000.12.30 12:34:56.789123400"}
`("can read $buffer", ({ buffer, date }: { buffer: string; date: string }) => {
    expect(buffer).toHaveLength(42);

    const result = readDateTimeExtended(Buffer.from(buffer));
    expect(result).toBe(date);
});
