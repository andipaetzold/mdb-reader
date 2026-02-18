import { createDecipheriv, createHash } from "node:crypto";
import { inflateSync } from "node:zlib";
import type { Environment } from "./types.js";

export const environment: Environment = {
    inflate: (data) => inflateSync(data),
    createDecipheriv,
    createHash,
};
