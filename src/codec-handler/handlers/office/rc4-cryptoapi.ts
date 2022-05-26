import { createRC4Decrypter, decryptRC4, hash } from "../../../crypto/index.js";
import { fixBufferLength, intToBuffer, roundToFullByte } from "../../../util.js";
import { CodecHandler, DecryptPage } from "../../types.js";
import { getPageEncodingKey } from "../../util.js";
import { CryptoAlgorithm, CRYPTO_ALGORITHMS } from "./CryptoAlgorithm.js";
import { EncryptionHeader, parseEncryptionHeader } from "./EncryptionHeader.js";
import { parseEncryptionVerifier } from "./EncryptionVerifier.js";
import { HashAlgorithm, HASH_ALGORITHMS } from "./HashAlgorithm.js";

const VALID_CRYPTO_ALGORITHMS: CryptoAlgorithm[] = [CRYPTO_ALGORITHMS.RC4];
const VALID_HASH_ALGORITHMS: HashAlgorithm[] = [HASH_ALGORITHMS.SHA1];

export function createRC4CryptoAPICodecHandler(
    encodingKey: Buffer,
    encryptionProvider: Buffer,
    password: Buffer
): CodecHandler {
    const headerLength = encryptionProvider.readInt32LE(8);
    const headerBuffer = encryptionProvider.slice(12, 12 + headerLength);

    const encryptionHeader = parseEncryptionHeader(headerBuffer, VALID_CRYPTO_ALGORITHMS, VALID_HASH_ALGORITHMS);
    const encryptionVerifier = parseEncryptionVerifier(encryptionProvider, encryptionHeader.cryptoAlgorithm);

    const baseHash = hash("sha1", [encryptionVerifier.salt, password]);

    const decryptPage: DecryptPage = (pageBuffer, pageIndex) => {
        const pageEncodingKey = getPageEncodingKey(encodingKey, pageIndex);
        const encryptionKey = getEncryptionKey(encryptionHeader, baseHash, pageEncodingKey);
        return decryptRC4(encryptionKey, pageBuffer);
    };
    return {
        decryptPage,
        verifyPassword: () => {
            const encryptionKey = getEncryptionKey(encryptionHeader, baseHash, intToBuffer(0));

            const rc4Decrypter = createRC4Decrypter(encryptionKey);

            const verifier = rc4Decrypter(encryptionVerifier.encryptionVerifier);
            const verifierHash = fixBufferLength(
                rc4Decrypter(encryptionVerifier.encryptionVerifierHash),
                encryptionVerifier.encryptionVerifierHashSize
            );

            const testHash = fixBufferLength(hash("sha1", [verifier]), encryptionVerifier.encryptionVerifierHashSize);

            return verifierHash.equals(testHash);
        },
    };
}

function getEncryptionKey(header: EncryptionHeader, baseHash: Buffer, data: Buffer): Buffer {
    const key = hash("sha1", [baseHash, data], roundToFullByte(header.keySize));
    if (header.keySize === 40) {
        return key.slice(0, roundToFullByte(128));
    }
    return key;
}
