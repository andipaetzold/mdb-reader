export interface EncryptionDescriptor {
    keyData: KeyData;
    passwordKeyEncryptor: PasswordKeyEncryptor;
}

export interface KeyData {
    blockSize: number;

    cipher: {
        algorithm: string;
        chaining: string;
    };

    hash: {
        size: number;
        algorithm: string;
    };

    salt: Buffer;
}

export interface PasswordKeyEncryptor {
    blockSize: number;
    keyBits: number;
    spinCount: number;

    cipher: {
        algorithm: string;
        chaining: string;
    };

    hash: {
        size: number;
        algorithm: string;
    };

    salt: Buffer;

    encrypted: {
        verifierHashInput: Buffer;
        verifierHashValue: Buffer;
        keyValue: Buffer;
    };
}
