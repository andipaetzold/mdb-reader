import * as crypto from "crypto";
import { CreateHash } from "./PageDecrypter/office/agile/types";
import { fixBufferLength, intToBuffer } from "./util";

interface Cipher {
    algorithm: string;
    chaining: string;
}

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

export function blockDecrypt(cipher: Cipher, key: Buffer, iv: Buffer, data: Buffer): Buffer {
    const algorithm = `${cipher.algorithm}-${key.length * 8}-${cipher.chaining.slice(-3)}`;
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAutoPadding(false);
    return decipher.update(data);
}
