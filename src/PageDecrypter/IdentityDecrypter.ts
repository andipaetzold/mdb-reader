import { PageDecrypter } from "./types";

export function createIdentityDecrypter(): PageDecrypter {
    return (b) => b;
}
