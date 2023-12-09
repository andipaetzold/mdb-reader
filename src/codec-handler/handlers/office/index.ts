import { isEmptyBuffer } from "../../../util.js";
import { createIdentityHandler } from "../identity.js";
import { createAgileCodecHandler } from "./agile/index.js";
import { EncryptionHeaderFlags, isFlagSet } from "./EncryptionHeader.js";
import { createRC4CryptoAPICodecHandler } from "./rc4-cryptoapi.js";
import type { CodecHandler } from "../../types.js";

const MAX_PASSWORD_LENGTH = 255;
const CRYPT_STRUCTURE_OFFSET = 0x299;

// https://github.com/jahlborn/jackcessencrypt/blob/7a6003d9923f793deefa8efc0d7932970347949e/src/main/java/com/healthmarketscience/jackcess/crypt/impl/OfficeCryptCodecHandler.java

const KEY_OFFSET = 0x3e;
const KEY_SIZE = 4;

export async function createOfficeCodecHandler(databaseDefinitionPage: Buffer, password: string): Promise<CodecHandler> {
    const encodingKey = databaseDefinitionPage.slice(KEY_OFFSET, KEY_OFFSET + KEY_SIZE);

    if (isEmptyBuffer(encodingKey)) {
        return createIdentityHandler();
    }

    const passwordBuffer = Buffer.from(password.substring(0, MAX_PASSWORD_LENGTH), "utf16le");

    const infoLength = databaseDefinitionPage.readUInt16LE(CRYPT_STRUCTURE_OFFSET);
    const encryptionProviderBuffer = databaseDefinitionPage.slice(
        CRYPT_STRUCTURE_OFFSET + 2,
        CRYPT_STRUCTURE_OFFSET + 2 + infoLength
    );

    const version = `${encryptionProviderBuffer.readUInt16LE(0)}.${encryptionProviderBuffer.readUInt16LE(2)}`;

    switch (version) {
        case "4.4":
            // Agile Encryption: 4.4
            return await createAgileCodecHandler(encodingKey, encryptionProviderBuffer, passwordBuffer);

        case "4.3":
        case "3.3":
            throw new Error("Extensible encryption provider is not supported");

        case "4.2":
        case "3.2":
        case "2.2": {
            const flags = encryptionProviderBuffer.readInt32LE(4);
            if (isFlagSet(flags, EncryptionHeaderFlags.FCRYPTO_API_FLAG)) {
                if (isFlagSet(flags, EncryptionHeaderFlags.FAES_FLAG)) {
                    // Standard Encryption
                    throw new Error("Not implemented yet");
                } else {
                    try {
                        // RC4 CryptoAPI Encryption
                        return createRC4CryptoAPICodecHandler(encodingKey, encryptionProviderBuffer, passwordBuffer);
                    } catch (e) {
                        // Non Standard Encryption
                    }

                    throw new Error("Not implemented yet");
                }
            } else {
                throw new Error("Unknown encryption");
            }
        }

        case "1.1":
            // RC4 Encryption: 1.1
            throw new Error("Not implemented yet");

        default:
            throw new Error(`Unsupported encryption provider: ${version}`);
    }
}
