import { CreateHash } from "../PageDecrypter/office/agile/types";
import { fixBufferLength } from "../util";

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
