import browserifyAES from "browserify-aes/browser.js";
import { inflate as pakoInflate } from "pako";
import type { Environment } from "./types.js";
import { default as createHash } from "create-hash";

export const environment: Environment = {
    inflate: (data) => Buffer.from(pakoInflate(data)),
    createDecipheriv: browserifyAES.createDecipheriv,
    createHash,
};
