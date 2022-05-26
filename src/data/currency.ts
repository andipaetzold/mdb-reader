import { addArray, multiplyArray, toArray } from "../array.js";
import { buildValue } from "./util.js";

const MAX_PRECISION = 20;

/**
 * @see https://github.com/mdbtools/mdbtools/blob/c3df30837ec2439d18c5515906072dc3306c0795/src/libmdb/money.c#L33-L75
 */
export function readCurrency(buffer: Buffer): string {
    const bytesCount = 8;
    const scale = 4;

    let product: ReadonlyArray<number> = toArray(0, MAX_PRECISION);
    let multiplier: ReadonlyArray<number> = toArray(1, MAX_PRECISION);
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
        product = addArray(product, multiplyArray(multiplier, toArray(byte, MAX_PRECISION)));
        multiplier = multiplyArray(multiplier, toArray(256, MAX_PRECISION));
    }

    return buildValue(product, scale, negative);
}
