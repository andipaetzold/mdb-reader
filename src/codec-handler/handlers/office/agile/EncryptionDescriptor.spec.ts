import { describe, it, expect } from "vitest";
import { parseEncryptionDescriptor } from "./EncryptionDescriptor.js";

function descriptor(spinCount: string | undefined): Buffer {
    const spinCountAttribute = spinCount === undefined ? "" : ` spinCount="${spinCount}"`;
    const xml = `<encryption>
        <keyData blockSize="16" hashSize="64" cipherAlgorithm="AES"
            cipherChaining="ChainingModeCBC" saltValue="AA==" />
        <keyEncryptors><keyEncryptor><p:encryptedKey${spinCountAttribute}
            blockSize="16" keyBits="256" hashSize="64" hashAlgorithm="SHA512"
            cipherAlgorithm="AES" cipherChaining="ChainingModeCBC" saltValue="AA=="
            encryptedKeyValue="AA==" encryptedVerifierHashInput="AA=="
            encryptedVerifierHashValue="AA==" /></keyEncryptor></keyEncryptors>
    </encryption>`;
    const header = Buffer.alloc(8);
    header.writeInt16LE(0x40, 4);
    return Buffer.concat([header, Buffer.from(xml, "ascii")]);
}

describe("parseEncryptionDescriptor", () => {
    for (const spinCount of [0, 1, 100000, 10000000]) {
        it(`should accept spinCount ${spinCount}`, () => {
            expect(parseEncryptionDescriptor(descriptor(String(spinCount))).passwordKeyEncryptor.spinCount).toBe(
                spinCount
            );
        });
    }

    for (const spinCount of ["10000001", "2147e6", "1e9999", "Infinity", "NaN", "-1", "1.5", "true", "false", "", undefined]) {
        it(`should reject spinCount ${String(spinCount)}`, () => {
            expect(() => parseEncryptionDescriptor(descriptor(spinCount))).toThrow("Invalid spinCount ");
        });
    }
});
