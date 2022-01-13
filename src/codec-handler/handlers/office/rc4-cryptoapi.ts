import { CodecHandler } from "../..";
import { decryptRC4, hash } from "../../../crypto";
import { roundToFullByte } from "../../../util";
import { DecryptPage } from "../../types";
import { getPageEncodingKey } from "../../util";
import { CryptoAlgorithm, CRYPTO_ALGORITHMS } from "./CryptoAlgorithm";
import { parseEncryptionHeader } from "./EncryptionHeader";
import { parseEncryptionVerifier } from "./EncryptionVerifier";
import { HashAlgorithm, HASH_ALGORITHMS } from "./HashAlgorithm";

const VALID_CRYPTO_ALGORITHMS: CryptoAlgorithm[] = [CRYPTO_ALGORITHMS.RC4];
const VALID_HASH_ALGORITHMS: HashAlgorithm[] = [HASH_ALGORITHMS.SHA1];

export function createRC4CryptoAPICodecHandler(
    encodingKey: Buffer,
    encryptionProvider: Buffer,
    password: Buffer
): CodecHandler {
    const headerLength = encryptionProvider.readInt32LE(8);
    const headerBuffer = encryptionProvider.slice(12, 12 + headerLength);

    const header = parseEncryptionHeader(headerBuffer, VALID_CRYPTO_ALGORITHMS, VALID_HASH_ALGORITHMS);

    const verifier = parseEncryptionVerifier(encryptionProvider, header.cryptoAlgorithm);

    const baseHash = hash("sha1", [verifier.salt, password]);

    const decryptPage: DecryptPage = (pageBuffer, pageIndex) => {
        const pageEncodingKey = getPageEncodingKey(encodingKey, pageIndex);
        let key = hash("sha1", [baseHash, pageEncodingKey], roundToFullByte(header.keySize));
        if (header.keySize === 40) {
            key = key.slice(0, roundToFullByte(128));
        }
        return decryptRC4(key, pageBuffer);
    };
    return {
        decryptPage,
        verifyPassword: () => true,
    };
}
