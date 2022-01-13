import { CryptoAlgorithm, CRYPTO_ALGORITHMS } from "./CryptoAlgorithm";
import { HashAlgorithm, HASH_ALGORITHMS } from "./HashAlgorithm";

const FLAGS_OFFSET = 0;
const CRYPTO_OFFSET = 8;
const HASH_OFFSET = 12;
const KEY_SIZE_OFFSET = 16;

export const EncryptionHeaderFlags = {
    FCRYPTO_API_FLAG: 0x04,
    FDOC_PROPS_FLAG: 0x08,
    FEXTERNAL_FLAG: 0x10,
    FAES_FLAG: 0x20,
};

export interface EncryptionHeader {
    cryptoAlgorithm: CryptoAlgorithm;
    keySize: number;
    hashAlgorithm: HashAlgorithm;
}

export function parseEncryptionHeader(
    buffer: Buffer,
    validCryptoAlgorithms: CryptoAlgorithm[],
    validHashAlgorithm: HashAlgorithm[]
): EncryptionHeader {
    const flags = buffer.readInt32LE(FLAGS_OFFSET);

    const cryptoAlgorithm = getCryptoAlgorithm(buffer.readInt32LE(CRYPTO_OFFSET), flags);
    const hashAlgorithm = getHashAlgorithm(buffer.readInt32LE(HASH_OFFSET), flags);
    const keySize = getKeySize(buffer.readInt32LE(KEY_SIZE_OFFSET), cryptoAlgorithm, getCSPName(buffer.slice(32)));

    if (!validCryptoAlgorithms.includes(cryptoAlgorithm)) {
        throw new Error("Invalid encryption algorithm");
    }

    if (!validHashAlgorithm.includes(hashAlgorithm)) {
        throw new Error("Invalid hash algorithm");
    }

    if (!cryptoAlgorithm.isValidKeySize(keySize)) {
        throw new Error("Invalid key size");
    }

    if (keySize % 8 !== 0) {
        throw new Error("Key size must be multiple of 8");
    }

    return {
        cryptoAlgorithm,
        hashAlgorithm,
        keySize,
    };
}

function getCryptoAlgorithm(id: number, flags: number): CryptoAlgorithm {
    if (id === CRYPTO_ALGORITHMS.EXTERNAL.id) {
        if (isFlagSet(flags, EncryptionHeaderFlags.FEXTERNAL_FLAG)) {
            return CRYPTO_ALGORITHMS.EXTERNAL;
        }
        if (isFlagSet(flags, EncryptionHeaderFlags.FCRYPTO_API_FLAG)) {
            if (isFlagSet(flags, EncryptionHeaderFlags.FAES_FLAG)) {
                return CRYPTO_ALGORITHMS.AES_128;
            } else {
                return CRYPTO_ALGORITHMS.RC4;
            }
        }
        throw new Error("Unsupported encryption algorithm");
    }

    const algorithm = Object.values(CRYPTO_ALGORITHMS).find((alg) => alg.id === id);
    if (algorithm) {
        return algorithm;
    }

    throw new Error("Unsupported encryption algorithm");
}

function getHashAlgorithm(id: number, flags: number): HashAlgorithm {
    if (id === HASH_ALGORITHMS.EXTERNAL.id) {
        if (isFlagSet(flags, EncryptionHeaderFlags.FEXTERNAL_FLAG)) {
            return HASH_ALGORITHMS.EXTERNAL;
        }
        return HASH_ALGORITHMS.SHA1;
    }

    const algorithm = Object.values(HASH_ALGORITHMS).find((alg) => alg.id === id);
    if (algorithm) {
        return algorithm;
    }

    throw new Error("Unsupported hash algorithm");
}

function getCSPName(buffer: Buffer): string {
    const str = buffer.toString("utf16le");
    return str.slice(0, str.length - 1);
}

function getKeySize(keySize: number, algorithm: CryptoAlgorithm, cspName: string): number {
    if (keySize !== 0) {
        return keySize;
    }

    if (algorithm === CRYPTO_ALGORITHMS.RC4) {
        const cspLowerTrimmed = cspName.trim().toLowerCase();
        if (cspLowerTrimmed.length === 0 || cspLowerTrimmed.includes(" base ")) {
            return 0x28;
        } else {
            return 0x80;
        }
    }

    return 0;
}

export function isFlagSet(flagValue: number, flagMask: number): boolean {
    return (flagValue & flagMask) !== 0;
}
