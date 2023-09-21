import browserifyAES from "browserify-aes/browser.js";
export const createDecipheriv = browserifyAES.createDecipheriv;

// @ts-expect-error "Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature."
export const webcrypto = globalThis.crypto;
