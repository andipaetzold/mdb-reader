import { webcrypto } from "../environment/index.js";
import { fixBufferLength } from "../util.js";

const algorithmMap: Record<string, string | undefined> = {
    sha1: "SHA-1",
    sha256: "SHA-256",
    sha384: "SHA-384",
    sha512: "SHA-512",
};

export async function hash(algorithm: string, buffers: Buffer[], length?: number): Promise<Buffer> {
    const webcryptoAlgorithm = algorithmMap[algorithm.toLowerCase()];
    if (!webcryptoAlgorithm) {
        throw new Error(`Unknown hashing algorithm: "${algorithm}"`);
    }

    const concatBuffer = Buffer.concat(buffers);
    const result = await webcrypto.subtle.digest(algorithm, concatBuffer);
    const resultAsBuffer = Buffer.from(result);

    if (length === undefined) {
        return resultAsBuffer;
    }

    return fixBufferLength(resultAsBuffer, length);
}
