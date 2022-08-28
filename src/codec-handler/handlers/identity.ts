import { CodecHandler } from "../types.js";

export function createIdentityHandler(): CodecHandler {
    return {
        decryptPage: (b) => b,
        verifyPassword: () => true
    };
}
