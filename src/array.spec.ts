import { doCarry, multiplyArray } from "./array";

describe("doCarry", () => {
    it.each`
        input        | output
        ${[0, 0, 0]} | ${[0, 0, 0]}
        ${[1, 2, 3]} | ${[1, 2, 3]}
        ${[9, 9, 9]} | ${[9, 9, 9]}
    `("does not carry if all < 10: $input", ({ input, output }) => {
        expect(doCarry(input)).toStrictEqual(output);
    });

    it.each`
        input          | output
        ${[10, 0, 0]}  | ${[0, 1, 0]}
        ${[0, 20, 0]}  | ${[0, 0, 2]}
        ${[13, 25, 0]} | ${[3, 6, 2]}
        ${[100, 0, 0]} | ${[0, 0, 1]}
        ${[111, 0, 0]} | ${[1, 1, 1]}
    `("carries over: $input", ({ input, output }) => {
        expect(doCarry(input)).toStrictEqual(output);
    });

    it.each`
        input             | output
        ${[1000, 0, 0]}   | ${[0, 0, 0]}
        ${[1111, 0, 0]}   | ${[1, 1, 1]}
        ${[1111, 222, 0]} | ${[1, 3, 3]}
    `("cuts overflow and keeps array length: $input", ({ input, output }) => {
        expect(doCarry(input)).toStrictEqual(output);
    });
});

describe("multiplyArray", () => {
    it.each`
        a            | b            | output
        ${[0, 0, 0]} | ${[5, 0, 0]} | ${[0, 0, 0]}
        ${[1, 1, 1]} | ${[5, 0, 0]} | ${[5, 5, 5]}
        ${[2, 4, 3]} | ${[2, 0, 0]} | ${[4, 8, 6]}
        ${[2, 4, 3]} | ${[0, 0, 0]} | ${[0, 0, 0]}
    `("multiply without carry: $a * $b", ({ a, b, output }) => {
        expect(multiplyArray(a, b)).toStrictEqual(output);
    });

    it.each`
        a            | b             | output
        ${[2, 2, 0]} | ${[5, 5, 5]}  | ${[0, 1, 2]}
        ${[5, 5, 0]} | ${[10, 0, 0]} | ${[0, 5, 5]}
        ${[3, 4, 4]} | ${[5, 6, 7]}  | ${[5, 9, 8]}
    `("multiply without carry: $a * $b", ({ a, b, output }) => {
        expect(multiplyArray(a, b)).toStrictEqual(output);
    });
});
