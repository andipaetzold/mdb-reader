const MAX_NUMERIC_PRECISION = 28;

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/money.c#L36-L80
 */
export function readMoney(buffer: Buffer): number {
    const bytesCount = 8;
    const scale = 4;

    let product: number[] = new Array(MAX_NUMERIC_PRECISION).fill(0);
    let multiplier: number[] = new Array(MAX_NUMERIC_PRECISION).fill(0);
    multiplier[0] = 1;

    const bytes = buffer.slice(0, bytesCount);

    let negative = false;
    if (bytes[bytesCount - 1] & 0x80) {
        negative = true;
        for (let i = 0; i < bytesCount; ++i) {
            bytes[i] = -bytes[i];
        }
        for (let i = 0; i < bytesCount; ++i) {
            ++bytes[i];
            if (bytes[i] != 0) {
                break;
            }
        }
    }

    for (let i = 0; i < bytesCount; ++i) {
        product = multiplyByte(product, bytes[i], multiplier);

        const temp = multiplier.slice(0, MAX_NUMERIC_PRECISION);
        multiplier.fill(0, 0, MAX_NUMERIC_PRECISION);
        multiplier = multiplyByte(multiplier, 256, temp);
    }

    return calcValue(product, scale, negative);
}

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/money.c#L82-L107
 */
export function readNumeric(
    buffer: Buffer,
    _precision: number,
    scale: number
): number {
    const bytesCount = 16;

    let product: number[] = new Array(MAX_NUMERIC_PRECISION).fill(0);
    let multiplier: number[] = new Array(MAX_NUMERIC_PRECISION).fill(0);
    multiplier[0] = 1;

    const bytes = buffer.slice(1, bytesCount);

    for (let i = 0; i < bytesCount; ++i) {
        product = multiplyByte(
            product,
            bytes[12 - 4 * (i / 4) + (i % 4)],
            multiplier
        );

        const temp = multiplier.slice(0, MAX_NUMERIC_PRECISION);
        multiplier.fill(0, 0, MAX_NUMERIC_PRECISION);
        multiplier = multiplyByte(multiplier, 256, temp);
    }

    const negative = !!(buffer[0] & 0x80);
    return calcValue(product, scale, negative);
}

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/money.c#L109-L127
 */
function multiplyByte(
    product: number[],
    num: number,
    multiplier: number[]
): number[] {
    const number = [
        num % 10,
        Math.floor(num / 10) % 10,
        Math.floor(num / 100) % 100,
    ];

    let result = [...product];
    for (let i = 0; i < MAX_NUMERIC_PRECISION; ++i) {
        if (multiplier[i] === 0) {
            continue;
        }

        for (let j = 0; j < 3; ++j) {
            if (number[j] === 0) {
                continue;
            }
            product[i + j] += multiplier[i] * number[j];
            result = doCarry(product);
        }
    }
    return result;
}

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/money.c#L128-L142
 */
function doCarry(product: number[]): number[] {
    const result = [...product];
    for (let j = 0; j < MAX_NUMERIC_PRECISION - 1; ++j) {
        if (product[j] > 9) {
            product[j + 1] += product[j] / 10;
            product[j] = product[j] % 10;
        }
    }
    if (product[MAX_NUMERIC_PRECISION] > 9) {
        product[MAX_NUMERIC_PRECISION] = product[MAX_NUMERIC_PRECISION] % 10;
    }
    return result;
}

function calcValue(
    product: number[],
    scale: number,
    negative: boolean
): number {
    let value = 0;
    for (let i = MAX_NUMERIC_PRECISION; i > 0; --i) {
        value *= 10;
        value += product[i];
    }
    value /= 10 ^ scale;

    if (negative) {
        value *= -1;
    }

    return value;
}
