import type { Environment } from "../environment/types.js";
import { fixBufferLength } from "../util.js";

export function hash(environment: Environment, algorithm: string, buffers: Buffer[], length?: number): Buffer {
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
