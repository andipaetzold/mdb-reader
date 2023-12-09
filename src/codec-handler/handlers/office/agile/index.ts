import type { CodecHandler, VerifyPassword } from "../../../index.js";
import { blockDecrypt, deriveKey, hash } from "../../../../crypto/index.js";
import { fixBufferLength, roundToFullByte } from "../../../../util.js";
import type { DecryptPage } from "../../../types.js";
import { getPageEncodingKey } from "../../../util.js";
import { parseEncryptionDescriptor } from "./EncryptionDescriptor.js";
import type { PasswordKeyEncryptor } from "./types.js";

const ENC_VERIFIER_INPUT_BLOCK = [0xfe, 0xa7, 0xd2, 0x76, 0x3b, 0x4b, 0x9e, 0x79];
const ENC_VERIFIER_VALUE_BLOCK = [0xd7, 0xaa, 0x0f, 0x6d, 0x30, 0x61, 0x34, 0x4e];
const ENC_VALUE_BLOCK = [0x14, 0x6e, 0x0b, 0xe7, 0xab, 0xac, 0xd0, 0xd6];

export async function createAgileCodecHandler(
    encodingKey: Buffer,
    encryptionProvider: Buffer,
    password: Buffer
): Promise<CodecHandler> {
    const { keyData, passwordKeyEncryptor } = parseEncryptionDescriptor(encryptionProvider);

    const decryptKeyValueKey = await getDecryptKeyValueKey(password, passwordKeyEncryptor);
    const keyValue = await decryptKeyValue(decryptKeyValueKey, passwordKeyEncryptor);

    const decryptPage: DecryptPage = async (b, pageNumber) => {
        const pageEncodingKey = getPageEncodingKey(encodingKey, pageNumber);
        const iv = await hash(keyData.hash.algorithm, [keyData.salt, pageEncodingKey], keyData.blockSize);

        return await blockDecrypt(keyData.cipher, keyValue, iv, b);
    };

    const verifyPassword: VerifyPassword = async () => {
        // `verifyPassword` is only called once, so there is no benefit of caching the values in outer scope
        const decryptVerifierHashInputKey = await getDecryptVerifierHashInputKey(password, passwordKeyEncryptor);
        const verifierHashInput = await decryptVerifierHashInput(decryptVerifierHashInputKey, passwordKeyEncryptor);

        const decryptVerifierHashValueKey = await getDecryptVerifierHashValueKey(password, passwordKeyEncryptor);
        const verifierHashValue = await decryptVerifierHashValue(decryptVerifierHashValueKey, passwordKeyEncryptor);

        let testHash = await hash(passwordKeyEncryptor.hash.algorithm, [verifierHashInput]);

        const blockSize = passwordKeyEncryptor.blockSize;
        if (testHash.length % blockSize != 0) {
            const hashLength = Math.floor((testHash.length + blockSize - 1) / blockSize) * blockSize;
            testHash = fixBufferLength(testHash, hashLength);
        }

        return verifierHashValue.equals(testHash);
    };

    return {
        decryptPage,
        verifyPassword,
    };
}

// KEY VALUE
async function getDecryptKeyValueKey(password: Buffer, passwordKeyEncryptor: PasswordKeyEncryptor): Promise<Buffer> {
    return await deriveKey(
        password,
        Buffer.from(ENC_VALUE_BLOCK),
        passwordKeyEncryptor.hash.algorithm,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.spinCount,
        roundToFullByte(passwordKeyEncryptor.keyBits)
    );
}

async function decryptKeyValue(key: Buffer, passwordKeyEncryptor: PasswordKeyEncryptor): Promise<Buffer> {
    return await blockDecrypt(
        passwordKeyEncryptor.cipher,
        key,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.encrypted.keyValue
    );
}

// VERIFIER HASH INPUT
async function getDecryptVerifierHashInputKey(
    password: Buffer,
    passwordKeyEncryptor: PasswordKeyEncryptor
): Promise<Buffer> {
    return await deriveKey(
        password,
        Buffer.from(ENC_VERIFIER_INPUT_BLOCK),
        passwordKeyEncryptor.hash.algorithm,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.spinCount,
        roundToFullByte(passwordKeyEncryptor.keyBits)
    );
}

async function decryptVerifierHashInput(key: Buffer, passwordKeyEncryptor: PasswordKeyEncryptor): Promise<Buffer> {
    return await blockDecrypt(
        passwordKeyEncryptor.cipher,
        key,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.encrypted.verifierHashInput
    );
}

// VERIFIER HASH VALUE
async function getDecryptVerifierHashValueKey(
    password: Buffer,
    passwordKeyEncryptor: PasswordKeyEncryptor
): Promise<Buffer> {
    return await deriveKey(
        password,
        Buffer.from(ENC_VERIFIER_VALUE_BLOCK),
        passwordKeyEncryptor.hash.algorithm,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.spinCount,
        roundToFullByte(passwordKeyEncryptor.keyBits)
    );
}

async function decryptVerifierHashValue(key: Buffer, passwordKeyEncryptor: PasswordKeyEncryptor): Promise<Buffer> {
    return await blockDecrypt(
        passwordKeyEncryptor.cipher,
        key,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.encrypted.verifierHashValue
    );
}
