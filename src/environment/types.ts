export type Environment = {
    inflate: (data: Buffer) => Buffer;
    createDecipheriv: (algorithm: string, key: Buffer, iv: Buffer) => Decipher;
};

export type Decipher = {
    setAutoPadding: (padding: boolean) => void;
    update: (data: Buffer) => Buffer;
};
