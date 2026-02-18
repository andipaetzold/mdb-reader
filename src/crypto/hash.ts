import { environment } from "../environment/index.js";
import { fixBufferLength } from "../util.js";

export function hash(algorithm: string, buffers: Buffer[], length?: number): Buffer {
    const digest = environment.createHash(algorithm);

    for (const buffer of buffers) {
        digest.update(buffer);
    }

    const result = digest.digest();
    if (length !== undefined) {
        return fixBufferLength(result, length);
    }
    return result;
}
