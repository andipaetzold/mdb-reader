import { inflateSync } from "node:zlib";
import type { Environment } from "./types.js";

export { createDecipheriv, createHash } from "crypto";

export const environment: Environment = {
    inflate: (data) => inflateSync(data),
};
