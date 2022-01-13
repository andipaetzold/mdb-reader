export interface HashAlgorithm {
    id: number;
}

const EXTERNAL: HashAlgorithm = { id: 0 };
const SHA1: HashAlgorithm = { id: 0x8004 };

export const HASH_ALGORITHMS = { EXTERNAL, SHA1 };
