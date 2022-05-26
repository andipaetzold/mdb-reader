import { doCarry, multiplyArray } from "./array.js";
import forEach from "mocha-each";
import { expect } from "chai";

describe("array", () => {
    describe("doCarry", () => {
        forEach([
            [
                [0, 0, 0],
                [0, 0, 0],
            ],
            [
                [1, 2, 3],
                [1, 2, 3],
            ],
            [
                [9, 9, 9],
                [9, 9, 9],
            ],
        ]).it("does not carry if all < 10: %s", (input, output) => {
            expect(doCarry(input)).to.deep.eq(output);
        });

        forEach([
            [
                [10, 0, 0],
                [0, 1, 0],
            ],
            [
                [0, 20, 0],
                [0, 0, 2],
            ],
            [
                [13, 25, 0],
                [3, 6, 2],
            ],
            [
                [100, 0, 0],
                [0, 0, 1],
            ],
            [
                [111, 0, 0],
                [1, 1, 1],
            ],
        ]).it("carries over: $input", (input, output) => {
            expect(doCarry(input)).to.deep.eq(output);
        });

        forEach([
            [
                [1000, 0, 0],
                [0, 0, 0],
            ],
            [
                [1111, 0, 0],
                [1, 1, 1],
            ],
            [
                [1111, 222, 0],
                [1, 3, 3],
            ],
        ]).it("cuts overflow and keeps array length: %s", (input, output) => {
            expect(doCarry(input)).to.deep.eq(output);
        });
    });

    describe("multiplyArray", () => {
        forEach([
            [
                [0, 0, 0],
                [5, 0, 0],
                [0, 0, 0],
            ],
            [
                [1, 1, 1],
                [5, 0, 0],
                [5, 5, 5],
            ],
            [
                [2, 4, 3],
                [2, 0, 0],
                [4, 8, 6],
            ],
            [
                [2, 4, 3],
                [0, 0, 0],
                [0, 0, 0],
            ],
        ]).it("multiply without carry: %s * %s", (a, b, output) => {
            expect(multiplyArray(a, b)).to.deep.eq(output);
        });

        forEach([
            [
                [2, 2, 0],
                [5, 5, 5],
                [0, 1, 2],
            ],
            [
                [5, 5, 0],
                [10, 0, 0],
                [0, 5, 5],
            ],
            [
                [3, 4, 4],
                [5, 6, 7],
                [5, 9, 8],
            ],
        ]).it("multiply without carry: %s * %s", (a, b, output) => {
            expect(multiplyArray(a, b)).to.deep.eq(output);
        });
    });
});
