import { hash, iterateHash } from "../../../crypto-util";
import { fixBufferLength, roundToFullByte } from "../../../util";
import { PageDecrypter } from "../../types";
import { parseEncryptionDescriptor } from "./EncryptionDescriptor";
import { CreateHash, PasswordKeyEncryptor } from "./types";
import { cipher as forgeCipher, util as forgeUtil } from "node-forge";
import { getPageEncodingKey } from "../../util";

const ENC_VERIFIER_INPUT_BLOCK = [0xfe, 0xa7, 0xd2, 0x76, 0x3b, 0x4b, 0x9e, 0x79];
const ENC_VERIFIER_VALUE_BLOCK = [0xd7, 0xaa, 0x0f, 0x6d, 0x30, 0x61, 0x34, 0x4e];
const ENC_VALUE_BLOCK = Buffer.from([0x14, 0x6e, 0x0b, 0xe7, 0xab, 0xac, 0xd0, 0xd6]);

export function createAgilePageDecryter(encodingKey: Buffer, encryptionProvider: Buffer, password: Buffer): PageDecrypter {
    const { keyData, passwordKeyEncryptor } = parseEncryptionDescriptor(encryptionProvider);

    const key = decryptKeyValue(password, passwordKeyEncryptor);
    return (b, pageNumber) => {
        const pageEncodingKey = getPageEncodingKey(encodingKey, pageNumber);
        const iv = hash(keyData.hash.create, [keyData.salt, pageEncodingKey], keyData.blockSize);

        return blockDecrypt(key, iv, b);
    };
}

function decryptKeyValue(password: Buffer, passwordKeyEncryptor: PasswordKeyEncryptor): Buffer {
    const key = cryptDeriveKey(
        password,
        ENC_VALUE_BLOCK,
        passwordKeyEncryptor.hash.create,
        passwordKeyEncryptor.salt,
        passwordKeyEncryptor.spinCount,
        roundToFullByte(passwordKeyEncryptor.keyBits)
    );

    return blockDecrypt(key, passwordKeyEncryptor.salt, passwordKeyEncryptor.encrypted.keyValue);
}

function cryptDeriveKey(
    password: Buffer,
    blockBytes: Buffer,
    createHash: CreateHash,
    salt: Buffer,
    iterations: number,
    keyByteLength: number
): Buffer {
    const baseHash = hash(createHash, [salt, password]);
    const iterHash = iterateHash(createHash, baseHash, iterations);
    const finalHash = hash(createHash, [iterHash, blockBytes]);
    return fixBufferLength(finalHash, keyByteLength, 0x36);
}

function blockDecrypt(key: Buffer, iv: Buffer, data: Buffer): Buffer {
    const decipher = forgeCipher.createDecipher("AES-CBC", forgeUtil.createBuffer(key)); // TODO: use correct algorithm
    decipher.start({ iv: forgeUtil.createBuffer(iv) });
    decipher.update(forgeUtil.createBuffer(data));
    decipher.finish();
    return Buffer.from(decipher.output.toHex(), "hex");
}
