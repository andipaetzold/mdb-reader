import * as crypto from "crypto";
import { fixBufferLength, intToBuffer } from "./util";


export function iterateHash(createDigest: () => crypto.Hash, buffer: Buffer, iterations: number): Buffer {
    let iterHash = buffer;
    for (let i = 0; i < iterations; ++i) {
        iterHash = hash(createDigest, [intToBuffer(i), iterHash]);
    }
    return iterHash;
}
