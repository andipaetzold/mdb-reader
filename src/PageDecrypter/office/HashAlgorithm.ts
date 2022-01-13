export interface HashAlgorithm {
    id: number;
}

const HASH_ALGORITHM_EXTERNAL: HashAlgorithm = { id: 0 };
const HASH_ALGORITHM_SHA1: HashAlgorithm = { id: 0x8004 };

export const HASH_ALGORITHMS = {
    EXTERNAL: HASH_ALGORITHM_EXTERNAL,
    SHA1: HASH_ALGORITHM_SHA1,
};
