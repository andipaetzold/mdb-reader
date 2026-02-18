import { inflateSync } from "node:zlib";
import type { Environment } from "./types.js";
import { createDecipheriv } from "crypto";

export { createHash } from "crypto";

export const environment: Environment = {
    inflate: (data) => inflateSync(data),
    createDecipheriv,
};
