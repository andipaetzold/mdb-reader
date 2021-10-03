import { addArray, multiplyArray, toArray } from "./array";

const MAX_MONEY_PRECISION = 20;
const MAX_NUMERIC_PRECISION = 40;

/**
 * @see https://github.com/mdbtools/mdbtools/blob/c3df30837ec2439d18c5515906072dc3306c0795/src/libmdb/money.c#L33-L75
 */
export function readCurrency(buffer: Buffer): string {
    const bytesCount = 8;
    const scale = 4;

    let product: ReadonlyArray<number> = toArray(0, MAX_MONEY_PRECISION);
    let multiplier: ReadonlyArray<number> = toArray(1, MAX_MONEY_PRECISION);
    const bytes = buffer.slice(0, bytesCount);

    let negative = false;
    if (bytes[bytesCount - 1] & 0x80) {
        negative = true;
        for (let i = 0; i < bytesCount; ++i) {
            bytes[i] = ~bytes[i];
        }
        for (let i = 0; i < bytesCount; ++i) {
            ++bytes[i];
            if (bytes[i] != 0) {
                break;
            }
        }
    }

    for (const byte of bytes) {
        product = addArray(product, multiplyArray(multiplier, toArray(byte, MAX_MONEY_PRECISION)));
        multiplier = multiplyArray(multiplier, toArray(256, MAX_MONEY_PRECISION));
    }

    return buildValue(product, scale, negative);
}

/**
 * @see https://github.com/mdbtools/mdbtools/blob/c3df30837ec2439d18c5515906072dc3306c0795/src/libmdb/money.c#L77-L100
 */
export function readNumeric(buffer: Buffer, _precision: number, scale: number): string {
    let product: ReadonlyArray<number> = toArray(0, MAX_NUMERIC_PRECISION);
    let multiplier: ReadonlyArray<number> = toArray(1, MAX_NUMERIC_PRECISION);

    const bytes = buffer.slice(1, 17);
    for (let i = 0; i < bytes.length; ++i) {
        const byte = bytes[12 - 4 * Math.floor(i / 4) + (i % 4)];
        product = addArray(product, multiplyArray(multiplier, toArray(byte, MAX_NUMERIC_PRECISION)));
        multiplier = multiplyArray(multiplier, toArray(256, MAX_NUMERIC_PRECISION));
    }

    const negative = !!(buffer[0] & 0x80);
    return buildValue(product, scale, negative);
}

/**
 * @see https://github.com/mdbtools/mdbtools/blob/c3df30837ec2439d18c5515906072dc3306c0795/src/libmdb/money.c#L132-L156
 */
function buildValue(array: ReadonlyArray<number>, scale: number, negative: boolean): string {
    const length = array.length;

    let value = "";
    if (negative) {
        value += "-";
    }

    let top: number;
    for (top = length; top > 0 && top - 1 > scale && !array[top - 1]; top--) {}

    if (top === 0) {
        value += "0";
    } else {
        for (let i = top; i > 0; i--) {
            if (i === scale) {
                value += ".";
            }
            value += array[i - 1].toString();
        }
    }

    return value;
}
