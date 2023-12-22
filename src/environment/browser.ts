// @ts-expect-error "Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature."
export const webcrypto = globalThis.crypto;
