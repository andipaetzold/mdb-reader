export interface CodecHandler {
    decryptPage: DecryptPage;
    verifyPassword: VerifyPassword;
}

export type DecryptPage = (pageBuffer: Buffer, pageIndex: number) => Promise<Buffer>;
export type VerifyPassword = () => Promise<boolean>;
