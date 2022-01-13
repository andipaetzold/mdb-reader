export interface CryptoAlgorithm {
    readonly id: number;
    readonly encryptionVerifierHashLength: number;
    readonly keySizeMin: number;
    readonly keySizeMax: number;
}

const EXTERNAL: CryptoAlgorithm = {
    id: 0,
    encryptionVerifierHashLength: 0,
    keySizeMin: 0,
    keySizeMax: 0,
};

const RC4: CryptoAlgorithm = {
    id: 0x6801,
    encryptionVerifierHashLength: 20,
    keySizeMin: 0x28,
    keySizeMax: 0x200,
};

const AES_128: CryptoAlgorithm = {
    id: 0x6801,
    encryptionVerifierHashLength: 32,
    keySizeMin: 0x80,
    keySizeMax: 0x80,
};

const AES_192: CryptoAlgorithm = {
    id: 0x660f,
    encryptionVerifierHashLength: 32,
    keySizeMin: 0xc0,
    keySizeMax: 0xc0,
};

const AES_256: CryptoAlgorithm = {
    id: 0x6610,
    encryptionVerifierHashLength: 32,
    keySizeMin: 0x100,
    keySizeMax: 0x100,
};

export const CRYPTO_ALGORITHMS = { EXTERNAL, RC4, AES_128, AES_192, AES_256 };
