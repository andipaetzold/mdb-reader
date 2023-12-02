export interface CodecHandler {
    decryptPage: DecryptPage;
    verifyPassword: VerifyPassword;
}

export type DecryptPage = (pageBuffer: Buffer, pageIndex: number) => Promise<Buffer> | Buffer;
export type VerifyPassword = () => Promise<boolean> | boolean;
