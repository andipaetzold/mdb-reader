import type { CodecHandler } from "../types.js";

export function createIdentityHandler(): CodecHandler {
    return {
        decryptPage: async (b) => b,
        verifyPassword: async () => true,
    };
}
