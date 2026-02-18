export type Environment = {
    inflate: (data: Buffer) => Buffer;
    createDecipheriv: (algorithm: string, key: Buffer, iv: Buffer) => Decipher;
    createHash: (algorithm: string) => Hash;
};

export type Decipher = {
    setAutoPadding: (padding: boolean) => void;
    update: (data: Buffer) => Buffer;
};

export type Hash = {
    update: (data: Buffer) => void;
    digest: () => Buffer;
};
