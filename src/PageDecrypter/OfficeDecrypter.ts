import { isEmptyBuffer } from "../util";
import { dummyDecrypter } from "./DummyDecrypter";
import { createAgileDecryter } from "./office/AgileDecrypter";
import { PageDecrypter } from "./types";

const MAX_PASSWORD_LENGTH = 255;
const CRYPT_STRUCTURE_OFFSET = 0x299;

// https://github.com/jahlborn/jackcessencrypt/blob/7a6003d9923f793deefa8efc0d7932970347949e/src/main/java/com/healthmarketscience/jackcess/crypt/impl/OfficeCryptCodecHandler.java

const KEY_OFFSET = 0x3e;
const KEY_SIZE = 4;

export function createOfficePageDecrypter(databaseDefinitionPage: Buffer, password: string = ""): PageDecrypter {
    const encodingKey = databaseDefinitionPage.slice(KEY_OFFSET, KEY_OFFSET + KEY_SIZE);

    if (isEmptyBuffer(encodingKey)) {
        return dummyDecrypter;
    }

    const passwordBuffer = Buffer.from(password?.substr(0, MAX_PASSWORD_LENGTH), "utf16le");

    const infoLength = databaseDefinitionPage.readUInt16LE(CRYPT_STRUCTURE_OFFSET);
    const encryptionProviderBuffer = databaseDefinitionPage.slice(
        CRYPT_STRUCTURE_OFFSET + 2,
        CRYPT_STRUCTURE_OFFSET + 2 + infoLength
    );

    const versionMajor = encryptionProviderBuffer.readUInt16LE(0);
    const versionMinor = encryptionProviderBuffer.readUInt16LE(2);

    if (versionMajor === 4 && versionMinor === 4) {
        // Agile Encryption: 4.4
        return createAgileDecryter(encodingKey, encryptionProviderBuffer, passwordBuffer);
    } else if (versionMajor === 1 && versionMinor === 1) {
        // RC4 Encryption: 1.1
        throw new Error("Not implemented yet");
    } else if ((versionMajor == 3 || versionMajor == 4) && versionMinor == 3) {
        throw new Error("Extensible encryption provider is not supported");
    } else if ((versionMajor == 2 || versionMajor == 3 || versionMajor == 4) && versionMinor == 2) {
        throw new Error("Not implemented yet");
    }

    throw new Error(`Unsupported encryption provider: ${versionMajor}.${versionMinor}`);
}
