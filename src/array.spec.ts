import { describe, it, expect } from "vitest";
import { doCarry, multiplyArray } from "./array.js";

describe("array", () => {
    describe("doCarry", () => {
        it.each([
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
        ])("does not carry if all < 10: %s", (input, output) => {
            expect(doCarry(input)).toEqual(output);
        });

        it.each([
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
        ])("carries over: %s", (input, output) => {
            expect(doCarry(input)).toEqual(output);
        });

        it.each([
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
        ])("cuts overflow and keeps array length: %s", (input, output) => {
            expect(doCarry(input)).toEqual(output);
        });
    });

    describe("multiplyArray", () => {
        it.each([
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
        ])("multiply without carry: %s * %s", (a, b, output) => {
            expect(multiplyArray(a, b)).toEqual(output);
        });

        it.each([
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
        ])("multiply without carry: %s * %s", (a, b, output) => {
            expect(multiplyArray(a, b)).toEqual(output);
        });
    });
});
