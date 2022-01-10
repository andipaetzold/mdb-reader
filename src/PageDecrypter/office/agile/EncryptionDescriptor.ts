import { createHash } from "crypto";
import { XMLParser } from "fast-xml-parser";
import { EncryptionDescriptor } from "./types";

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: true,
});

const RESERVED_VALUE = 0x40;

export function parseEncryptionDescriptor(buffer: Buffer): EncryptionDescriptor {
    const reservedValue = buffer.readInt16LE(4);
    if (reservedValue !== RESERVED_VALUE) {
        throw new Error(`Unexpected reserved value ${reservedValue}`);
    }

    const xmlBuffer = buffer.slice(8); // leading @
    const xmlString = xmlBuffer.toString("ascii");
    const parsedXML: XMLEncryptionProvider = xmlParser.parse(xmlString);

    const keyData = parsedXML.encryption.keyData;
    const keyEncryptor = parsedXML.encryption.keyEncryptors.keyEncryptor["p:encryptedKey"];

    return {
        keyData: {
            blockSize: keyData.blockSize,
            cipher: {
                algorithm: keyData.cipherAlgorithm,
                chaining: keyData.cipherChaining,
            },
            hash: {
                size: keyData.hashSize,
                create: () => createHash(keyData.hashAlgorithm),
                algorithm: keyEncryptor.hashAlgorithm,
            },
            salt: Buffer.from(keyData.saltValue, "base64"),
        },
        passwordKeyEncryptor: {
            blockSize: keyEncryptor.blockSize,
            keyBits: keyEncryptor.keyBits,
            spinCount: keyEncryptor.spinCount,
            cipher: {
                algorithm: keyEncryptor.cipherAlgorithm,
                chaining: keyEncryptor.cipherChaining,
            },
            hash: {
                size: keyEncryptor.hashSize,
                create: () => createHash(keyEncryptor.hashAlgorithm),
                algorithm: keyEncryptor.hashAlgorithm,
            },
            salt: Buffer.from(keyEncryptor.saltValue, "base64"),
            encrypted: {
                keyValue: Buffer.from(keyEncryptor.encryptedKeyValue, "base64"),
                verifierHashInput: Buffer.from(keyEncryptor.encryptedVerifierHashInput, "base64"),
                verifierHashValue: Buffer.from(keyEncryptor.encryptedVerifierHashValue, "base64"),
            },
        },
    };
}

interface XMLEncryptionProvider {
    "?xml": XML;
    encryption: XMLEncryption;
}

interface XMLEncryption {
    keyData: XMLKey;
    keyEncryptors: XMLKeyEncryptors;
    xmlns: string;
    "xmlns:p": string;
    "xmlns:c": string;
}

interface XML {
    version: number;
    encoding: string;
    standalone: string;
}

interface XMLKey {
    saltSize: number;
    blockSize: number;
    keyBits: number;
    hashSize: number;
    cipherAlgorithm: string;
    cipherChaining: string;
    hashAlgorithm: string;
    saltValue: string;
}

interface XMLKeyEncryptors {
    keyEncryptor: XMLKeyEncryptor;
}

interface XMLKeyEncryptor {
    "p:encryptedKey": XMLEncryptedKey;
    uri: string;
}

interface XMLEncryptedKey {
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
