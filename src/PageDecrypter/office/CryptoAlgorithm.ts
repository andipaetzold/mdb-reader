export class CryptoAlgorithm {
    public constructor(
        public id: number,
        public encryptionVerifierHashLength: number,
        public keySizeMin: number,
        private keySizeMax: number
        ) {}
        
        public isValidKeySize(keySize: number) {
            return this.keySizeMin <= keySize && keySize <= this.keySizeMax;
        }
    }

export const CRYPTO_ALGORITHMS = {
    EXTERNAL: new CryptoAlgorithm(0, 0, 0, 0),
    RC4: new CryptoAlgorithm(0x6801, 20, 0x28, 0x200),
    AES_128: new CryptoAlgorithm(0x6801, 32, 0x80, 0x80),
    AES_192: new CryptoAlgorithm(0x660f, 32, 0xc0, 0xc0),
    AES_256: new CryptoAlgorithm(0x6610, 32, 0x100, 0x100),
};
