/**
 * Cannot be replaced with node's crypto module because RC4 was remove from all browsers
 */
export function decryptRC4(key: Buffer, data: Buffer): Buffer {
    const keyStream = createKeyStream(key);
    return decryptBuffer(data, keyStream);
}

/**
 * Key-scheduling algorithm (KSA)
 */
function createKeyStream(key: Buffer): Uint8Array {
    const S = new Uint8Array(256);
    for (let i = 0; i < 256; ++i) {
        S[i] = i;
    }
    let j = 0;
    for (let i = 0; i < 256; ++i) {
        j = (j + S[i] + key[i % key.length]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
    }

    return S;
}

/**
 * Pseudo-random generation algorithm (PRGA)
 */
function decryptBuffer(buffer: Buffer, S: Uint8Array): Buffer {
    const resultBuffer = Buffer.from(buffer);

    let i = 0;
    let j = 0;

    for (let k = 0; k < buffer.length; ++k) {
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
        resultBuffer[k] ^= S[(S[i] + S[j]) % 256];
    }

    return resultBuffer;
}
