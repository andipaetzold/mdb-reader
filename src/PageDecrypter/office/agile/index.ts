import { blockDecrypt, deriveKey, hash } from "../../../crypto";
import { roundToFullByte } from "../../../util";
import { PageDecrypter } from "../../types";
import { getPageEncodingKey } from "../../util";
import { parseEncryptionDescriptor } from "./EncryptionDescriptor";
import { PasswordKeyEncryptor } from "./types";

const ENC_VERIFIER_INPUT_BLOCK = [0xfe, 0xa7, 0xd2, 0x76, 0x3b, 0x4b, 0x9e, 0x79];
const ENC_VERIFIER_VALUE_BLOCK = [0xd7, 0xaa, 0x0f, 0x6d, 0x30, 0x61, 0x34, 0x4e];
const ENC_VALUE_BLOCK = Buffer.from([0x14, 0x6e, 0x0b, 0xe7, 0xab, 0xac, 0xd0, 0xd6]);

export function createAgilePageDecryter(encodingKey: Buffer, encryptionProvider: Buffer, password: Buffer): PageDecrypter {
    const { keyData, passwordKeyEncryptor } = parseEncryptionDescriptor(encryptionProvider);

    const key = decryptKeyValue(password, passwordKeyEncryptor);
    return (b, pageNumber) => {
        const pageEncodingKey = getPageEncodingKey(encodingKey, pageNumber);
        const iv = hash(keyData.hash.algorithm, [keyData.salt, pageEncodingKey], keyData.blockSize);

        return blockDecrypt(keyData.cipher, key, iv, b);
    };
}

function decryptKeyValue(password: Buffer, passwordKeyEncryptor: PasswordKeyEncryptor): Buffer {
    const key = deriveKey(
        password,
        ENC_VALUE_BLOCK,
        passwordKeyEncryptor.hash.algorithm,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.spinCount,
        roundToFullByte(passwordKeyEncryptor.keyBits)
    );

    return blockDecrypt(
        passwordKeyEncryptor.cipher,
        key,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.encrypted.keyValue
    );
}
