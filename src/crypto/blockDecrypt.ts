import { createDecipheriv } from "crypto";
import { Cipher } from "./types";

export function blockDecrypt(cipher: Cipher, key: Buffer, iv: Buffer, data: Buffer): Buffer {
    const algorithm = `${cipher.algorithm}-${key.length * 8}-${cipher.chaining.slice(-3)}`;
    const decipher = createDecipheriv(algorithm, key, iv);
    decipher.setAutoPadding(false);
    return decipher.update(data);
}

export function blockEncrypt(cipher: Cipher, key: Buffer, iv: Buffer, data: Buffer): Buffer {
    const algorithm = `${cipher.algorithm}-${key.length * 8}-${cipher.chaining.slice(-3)}`;
    const decipher = createDecipheriv(algorithm, key, iv);
    decipher.setAutoPadding(false);
    return decipher.update(data);
}
