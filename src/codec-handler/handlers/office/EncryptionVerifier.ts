import { CryptoAlgorithm } from "./CryptoAlgorithm";

// are those the same values for ECMA Standard?
const SALT_SIZE_OFFSET = 138;
const SALT_OFFSET = 142;

// const ENC_VERIFIER_SIZE = 16;
const SALT_SIZE = 16;

export interface EncryptionVerifier {
    readonly salt: Buffer;
}

export function parseEncryptionVerifier(encryptionProvider: Buffer, _cryptoAlgorithm: CryptoAlgorithm): EncryptionVerifier {
    const saltSize = encryptionProvider.readInt32LE(SALT_SIZE_OFFSET);

    if (saltSize !== SALT_SIZE) {
        throw new Error("Wrong salt size");
    }

    const salt = encryptionProvider.slice(SALT_OFFSET, SALT_OFFSET + SALT_SIZE);

    // const encryptionVerifierOffset = SALT_OFFSET + SALT_SIZE;
    // const verifierHashSizeOffset = encryptionVerifierOffset + ENC_VERIFIER_SIZE;
    // const verifierHashOffset = verifierHashSizeOffset + 4;

    // const encryptionVerifier = encryptionProvider.slice(encryptionVerifierOffset, verifierHashSizeOffset);
    // const verifierHashSize = encryptionProvider.readInt32LE(verifierHashSizeOffset);
    // const verifierHash = encryptionProvider.slice(
    //     verifierHashOffset,
    //     verifierHashOffset + cryptoAlgorithm.encryptionVerifierHashLength
    // );

    return { salt };
}
