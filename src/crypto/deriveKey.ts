import type { Environment } from "../environment/types.js";
import { fixBufferLength, intToBuffer } from "../util.js";
import { hash } from "./hash.js";

/**
 * Can probably be replaced with `crypto.webcrypto.subtle.derivekey(...)` once node 16 support is dropped
 */
export function deriveKey(
    password: Buffer,
    blockBytes: Buffer,
    algorithm: string,
    salt: Buffer,
    iterations: number,
    keyByteLength: number,
    environment: Environment,
): Buffer {
    const baseHash = hash(environment, algorithm, [salt, password]);
    const iterHash = iterateHash(algorithm, baseHash, iterations, environment);
    const finalHash = hash(environment, algorithm, [iterHash, blockBytes]);
    return fixBufferLength(finalHash, keyByteLength, 0x36);
}

function iterateHash(algorithm: string, baseBuffer: Buffer, iterations: number, environment: Environment): Buffer {
    let iterHash = baseBuffer;
    for (let i = 0; i < iterations; ++i) {
        iterHash = hash(environment, algorithm, [intToBuffer(i), iterHash]);
    }
    return iterHash;
}
