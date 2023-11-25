import { addArray, multiplyArray, toArray } from "../array.js";
import { Column } from "../column.js";
import { buildValue } from "./util.js";

const MAX_PRECISION = 40;

/**
 * @see https://github.com/mdbtools/mdbtools/blob/c3df30837ec2439d18c5515906072dc3306c0795/src/libmdb/money.c#L77-L100
 */
export function readNumeric(buffer: Buffer, column: Pick<Column, "scale" | "precision">): string {
    let product: ReadonlyArray<number> = toArray(0, MAX_PRECISION);
    let multiplier: ReadonlyArray<number> = toArray(1, MAX_PRECISION);

    const bytes = buffer.slice(1, 17);
    for (let i = 0; i < bytes.length; ++i) {
        const byte = bytes[12 - 4 * Math.floor(i / 4) + (i % 4)]!;
        product = addArray(product, multiplyArray(multiplier, toArray(byte, MAX_PRECISION)));
        multiplier = multiplyArray(multiplier, toArray(256, MAX_PRECISION));
    }

    const negative = !!(buffer[0]! & 0x80);
    return buildValue(
        product,
        // Scale is always set for numeric columns
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        column.scale!,
        negative
    );
}
