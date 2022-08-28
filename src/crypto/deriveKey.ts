import { fixBufferLength, intToBuffer } from "../util.js";
import { hash } from "./hash.js";

/**
 * Can probably be replaced with `crypto.webcrypto.subtle.derivekey(...)` once node 14 support is dropped
 */
export function deriveKey(
    password: Buffer,
    blockBytes: Buffer,
    algorithm: string,
    salt: Buffer,
    iterations: number,
    keyByteLength: number
): Buffer {
    const baseHash = hash(algorithm, [salt, password]);
    const iterHash = iterateHash(algorithm, baseHash, iterations);
    const finalHash = hash(algorithm, [iterHash, blockBytes]);
    return fixBufferLength(finalHash, keyByteLength, 0x36);
}

function iterateHash(algorithm: string, baseBuffer: Buffer, iterations: number): Buffer {
    let iterHash = baseBuffer;
    for (let i = 0; i < iterations; ++i) {
        iterHash = hash(algorithm, [intToBuffer(i), iterHash]);
    }
    return iterHash;
}
