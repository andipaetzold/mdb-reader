import { fixBufferLength, intToBuffer } from "../util.js";
import { hash } from "./hash.js";

export async function deriveKey(
    password: Buffer,
    blockBytes: Buffer,
    algorithm: string,
    salt: Buffer,
    iterations: number,
    keyByteLength: number
): Promise<Buffer> {
    const baseHash = await hash(algorithm, [salt, password]);
    const iterHash = await iterateHash(algorithm, baseHash, iterations);
    const finalHash = await hash(algorithm, [iterHash, blockBytes]);
    return fixBufferLength(finalHash, keyByteLength, 0x36);
}

async function iterateHash(algorithm: string, baseBuffer: Buffer, iterations: number): Promise<Buffer> {
    let iterHash = baseBuffer;
    for (let i = 0; i < iterations; ++i) {
        iterHash = await hash(algorithm, [intToBuffer(i), iterHash]);
    }
    return iterHash;
}
