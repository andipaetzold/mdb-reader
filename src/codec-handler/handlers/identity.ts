import { CodecHandler } from "../types";

export function createIdentityHandler(): CodecHandler {
    return {
        decryptPage: (b) => b,
        verifyPassword: () => true
    };
}
