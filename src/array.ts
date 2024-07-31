export function doCarry(values: ReadonlyArray<number>): number[] {
    const result = [...values];
    const length = result.length;

    for (let i = 0; i < length - 1; ++i) {
        result[i + 1]! += Math.floor(result[i]! / 10);
        result[i]! %= 10;
    }
    result[length - 1]! %= 10;

    return result;
}

export function multiplyArray(a: ReadonlyArray<number>, b: ReadonlyArray<number>): number[] {
    if (a.length !== b.length) {
        throw new Error("Array a and b must have the same length");
    }

    const result: number[] = new Array(a.length).fill(0);
    for (let i = 0; i < a.length; ++i) {
        if (a[i] === 0) continue;
        for (let j = 0; j < b.length; j++) {
            result[i + j]! += a[i]! * b[j]!;
        }
    }
    return doCarry(result.slice(0, a.length));
}

export function addArray(a: ReadonlyArray<number>, b: ReadonlyArray<number>): number[] {
    if (a.length !== b.length) {
        throw new Error("Array a and b must have the same length");
    }
    const length = a.length;

    const result: number[] = [];
    for (let i = 0; i < length; ++i) {
        result[i] = a[i]! + b[i]!;
    }
    return doCarry(result);
}

export function toArray(v: number, length: number) {
    return doCarry([v, ...new Array(length - 1).fill(0)]);
}
