import { Hash } from "crypto";
import { CreateHash } from "../PageDecrypter/office/agile/types";
import { fixBufferLength, intToBuffer } from "../util";
import { hash } from "./hash";

/**
 * Can probably be replaced with `crypto.webcrypto.subtle.derivekey(...)` once node 14 support is dropped
 */
export function deriveKey(
    password: Buffer,
    blockBytes: Buffer,
    createHash: CreateHash,
    salt: Buffer,
    iterations: number,
    keyByteLength: number
): Buffer {
    const baseHash = hash(createHash, [salt, password]);
    const iterHash = iterateHash(createHash, baseHash, iterations);
    const finalHash = hash(createHash, [iterHash, blockBytes]);
    return fixBufferLength(finalHash, keyByteLength, 0x36);
}

function iterateHash(createDigest: () => Hash, baseBuffer: Buffer, iterations: number): Buffer {
    let iterHash = baseBuffer;
    for (let i = 0; i < iterations; ++i) {
        iterHash = hash(createDigest, [intToBuffer(i), iterHash]);
    }
    return iterHash;
}
