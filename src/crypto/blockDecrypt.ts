import { webcrypto } from "../environment/index.js";
import type { Cipher } from "./types.js";

export async function blockDecrypt(cipher: Cipher, key: Buffer, iv: Buffer, encryptedData: Buffer): Promise<Buffer> {
    const algorithm = `${cipher.algorithm}-${cipher.chaining.slice(-3)}`.toUpperCase();
    const importedKey = await webcrypto.subtle.importKey("raw", key, algorithm, false, ["decrypt"]);
    const result = await webcrypto.subtle.decrypt({ name: algorithm, iv }, importedKey, encryptedData);
    return Buffer.from(result);
}
