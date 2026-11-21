import type { Environment } from "../environment/types.js";
import type { Cipher } from "./types.js";

export function blockDecrypt(cipher: Cipher, key: Buffer, iv: Buffer, data: Buffer, environment: Environment): Buffer {
    const algorithm = `${cipher.algorithm}-${key.length * 8}-${cipher.chaining.slice(-3)}`;
    const decipher = environment.createDecipheriv(algorithm, key, iv);
    decipher.setAutoPadding(false);
    return decipher.update(data);
}
