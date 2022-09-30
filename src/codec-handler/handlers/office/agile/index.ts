import { CodecHandler, VerifyPassword } from "../../../index.js";
import { blockDecrypt, deriveKey, hash } from "../../../../crypto/index.js";
import { fixBufferLength, roundToFullByte } from "../../../../util.js";
import { DecryptPage } from "../../../types.js";
import { getPageEncodingKey } from "../../../util.js";
import { parseEncryptionDescriptor } from "./EncryptionDescriptor.js";
import { PasswordKeyEncryptor } from "./types.js";

const ENC_VERIFIER_INPUT_BLOCK = [0xfe, 0xa7, 0xd2, 0x76, 0x3b, 0x4b, 0x9e, 0x79];
const ENC_VERIFIER_VALUE_BLOCK = [0xd7, 0xaa, 0x0f, 0x6d, 0x30, 0x61, 0x34, 0x4e];
const ENC_VALUE_BLOCK = [0x14, 0x6e, 0x0b, 0xe7, 0xab, 0xac, 0xd0, 0xd6];

export function createAgileCodecHandler(encodingKey: Buffer, encryptionProvider: Buffer, password: Buffer): CodecHandler {
    const { keyData, passwordKeyEncryptor } = parseEncryptionDescriptor(encryptionProvider);

    const key = decryptKeyValue(password, passwordKeyEncryptor);
    const decryptPage: DecryptPage = (b, pageNumber) => {
        const pageEncodingKey = getPageEncodingKey(encodingKey, pageNumber);
        const iv = hash(keyData.hash.algorithm, [keyData.salt, pageEncodingKey], keyData.blockSize);

        return blockDecrypt(keyData.cipher, key, iv, b);
    };

    const verifyPassword: VerifyPassword = () => {
        const verifier = decryptVerifierHashInput(password, passwordKeyEncryptor);
        const verifierHash = decryptVerifierHashValue(password, passwordKeyEncryptor);

        let testHash = hash(passwordKeyEncryptor.hash.algorithm, [verifier]);

        const blockSize = passwordKeyEncryptor.blockSize;
        if (testHash.length % blockSize != 0) {
            const hashLength = Math.floor((testHash.length + blockSize - 1) / blockSize) * blockSize;
            testHash = fixBufferLength(testHash, hashLength);
        }

        return verifierHash.equals(testHash);
    };

    return {
        decryptPage,
        verifyPassword,
    };
}

function decryptKeyValue(password: Buffer, passwordKeyEncryptor: PasswordKeyEncryptor): Buffer {
    const key = deriveKey(
        password,
        Buffer.from(ENC_VALUE_BLOCK),
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

function decryptVerifierHashInput(password: Buffer, passwordKeyEncryptor: PasswordKeyEncryptor): Buffer {
    const key = deriveKey(
        password,
        Buffer.from(ENC_VERIFIER_INPUT_BLOCK),
        passwordKeyEncryptor.hash.algorithm,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.spinCount,
        roundToFullByte(passwordKeyEncryptor.keyBits)
    );

    return blockDecrypt(
        passwordKeyEncryptor.cipher,
        key,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.encrypted.verifierHashInput
    );
}

function decryptVerifierHashValue(password: Buffer, passwordKeyEncryptor: PasswordKeyEncryptor): Buffer {
    const key = deriveKey(
        password,
        Buffer.from(ENC_VERIFIER_VALUE_BLOCK),
        passwordKeyEncryptor.hash.algorithm,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.spinCount,
        roundToFullByte(passwordKeyEncryptor.keyBits)
    );

    return blockDecrypt(
        passwordKeyEncryptor.cipher,
        key,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.encrypted.verifierHashValue
    );
}
