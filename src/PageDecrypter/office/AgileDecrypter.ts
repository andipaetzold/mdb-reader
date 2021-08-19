import { PageDecrypter } from "../types";
import { parse as parseXml } from "fast-xml-parser";
import * as crypto from "crypto";
import { fixBufferLength, intToBuffer } from "../../util";
import { hash, iterateHash } from "../../crypto-util";
import { getPageEncodingKey } from "../util";
import { decrypt } from "../../decrypt";

const RESERVED_VALUE = 0x40;

const ENC_VALUE_BLOCK = Buffer.from([0x14, 0x6e, 0x0b, 0xe7, 0xab, 0xac, 0xd0, 0xd6]);

export function createAgileDecryter(encodingKey: Buffer, encryptionProvider: Buffer, password: Buffer): PageDecrypter {
    const reservedValue = encryptionProvider.readInt16LE(4);
    if (reservedValue !== RESERVED_VALUE) {
        throw new Error(`Unexpected reserved value ${reservedValue}`);
    }

    const xmlBuffer = encryptionProvider.slice(8);
    const encryptionDescriptor: EncryptionDescriptor = parseXml(xmlBuffer.toString("ascii"), {
        arrayMode: true,
        ignoreAttributes: false,
        attributeNamePrefix: "",
        parseAttributeValue: true,
    });

    const passwordKeyEncryptor = getPasswordKeyEncryptor(encryptionDescriptor);
    const createPasswordDigest = () => crypto.createHash(passwordKeyEncryptor.hashAlgorithm);

    const cryptHashAlgorithm = encryptionDescriptor.encryption[0].keyData[0].hashAlgorithm;
    const createCryptDigest = () => crypto.createHash(cryptHashAlgorithm);

    const keyValue = decryptKeyValue(createCryptDigest, encryptionDescriptor, password, cryptHashAlgorithm);

    return (b, pageNumber) => {
        const block = getPageEncodingKey(encodingKey, pageNumber);

        const keyData = encryptionDescriptor.encryption[0].keyData[0];
        const iv = cryptDeriveIV(createCryptDigest, block, Buffer.from(keyData.saltValue), keyData.blockSize);

        return decrypt(b, block, iv);
    };
}

function decryptKeyValue(
    createDigest: () => crypto.Hash,
    encryptionDescriptor: EncryptionDescriptor,
    password: Buffer,
    cryptHashAlgorithm: string
): Buffer {
    const passwordKeyEncryptor = getPasswordKeyEncryptor(encryptionDescriptor);
    const key: Buffer = cryptDeriveKey(
        createDigest,
        password,
        ENC_VALUE_BLOCK,
        Buffer.from(passwordKeyEncryptor.saltValue),
        passwordKeyEncryptor.spinCount,
        passwordKeyEncryptor.keyBits / 8
    );

    return blockDecryptBytes(
        cryptHashAlgorithm,
        key,
        Buffer.from(passwordKeyEncryptor.saltValue),
        Buffer.from(passwordKeyEncryptor.encryptedKeyValue)
    );
}

function blockDecryptBytes(hashAlgorithm: string, key: Buffer, iv: Buffer, encodedBuffer: Buffer): Buffer {
    const decipher = crypto.createDecipheriv(hashAlgorithm, key, iv);
    decipher.update(encodedBuffer);
    return decipher.final();
}

function cryptDeriveKey(
    createDigest: () => crypto.Hash,
    password: Buffer,
    block: Buffer,
    salt: Buffer,
    iterations: number,
    keyLength: number
): Buffer {
    const baseHash = hash(createDigest, [salt, password]);
    const iterHash = iterateHash(createDigest, baseHash, iterations);
    const finalHash = hash(createDigest, [iterHash, block]);
    return fixBufferLength(finalHash, keyLength, 0x36);
}

function cryptDeriveIV(createDigest: () => crypto.Hash, block: Buffer | null, salt: Buffer, keyLength: number): Buffer {
    const iv = block === null ? salt : hash(createDigest, [salt, block]);
    return fixBufferLength(iv, keyLength, 0x36);
}

function getPasswordKeyEncryptor(encryptionDescriptor: EncryptionDescriptor): PasswordKeyEncryptor {
    try {
        const keyEncryptors = encryptionDescriptor.encryption[0].keyEncryptors;
        if (keyEncryptors.length > 1) {
            throw new Error("Can only handle single Key Encryptor");
        }
        const keyEncryptor = keyEncryptors[0].keyEncryptor[0];
        if (keyEncryptor["uri"] !== "http://schemas.microsoft.com/office/2006/keyEncryptor/password") {
            throw new Error("Unsupported Key Encryptor");
        }
        return keyEncryptor["p:encryptedKey"][0];
    } catch (e) {
        throw new Error("Could not get key encrypter");
    }
}

export interface EncryptionDescriptor {
    encryption: Encryption[];
}

export interface Encryption {
    xmlns: string;
    "xmlns:p": string;
    "xmlns:c": string;
    keyData: KeyDatum[];
    keyEncryptors: EncryptionKeyEncryptor[];
}

export interface KeyDatum {
    saltSize: number;
    blockSize: number;
    keyBits: string;
    hashSize: number;
    cipherAlgorithm: string;
    cipherChaining: string;
    hashAlgorithm: string;
    saltValue: string;
}

export interface EncryptionKeyEncryptor {
    keyEncryptor: KeyEncryptorKeyEncryptor[];
}

export interface KeyEncryptorKeyEncryptor {
    uri: string;
    "p:encryptedKey": PasswordKeyEncryptor[];
}

interface PasswordKeyEncryptor {
    spinCount: number;
    saltSize: number;
    blockSize: number;
    keyBits: number;
    hashSize: number;
    cipherAlgorithm: string;
    cipherChaining: string;
    hashAlgorithm: string;
    saltValue: string;
    encryptedVerifierHashInput: string;
    encryptedVerifierHashValue: string;
    encryptedKeyValue: string;
}
