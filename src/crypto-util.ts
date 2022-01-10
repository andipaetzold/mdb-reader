import * as crypto from "crypto";
import { CreateHash } from "./PageDecrypter/office/agile/types";
import { fixBufferLength, intToBuffer } from "./util";

export function hash(createHash: CreateHash, buffers: Buffer[], length?: number): Buffer {
    const digest = createHash();

    for (const buffer of buffers) {
        digest.update(buffer);
    }

    const result = digest.digest();
    if (length !== undefined) {
        return fixBufferLength(result, length);
    }
    return result;
}

export function iterateHash(createDigest: () => crypto.Hash, baseBuffer: Buffer, iterations: number): Buffer {
    let iterHash = baseBuffer;
    for (let i = 0; i < iterations; ++i) {
        iterHash = hash(createDigest, [intToBuffer(i), iterHash]);
    }
    return iterHash;
}
