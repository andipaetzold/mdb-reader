import { createHash } from "crypto";
import { fixBufferLength } from "../util";

export function hash(algorithm: string, buffers: Buffer[], length?: number): Buffer {
    const digest = createHash(algorithm);

    for (const buffer of buffers) {
        digest.update(buffer);
    }

    const result = digest.digest();
    if (length !== undefined) {
        return fixBufferLength(result, length);
    }
    return result;
}
