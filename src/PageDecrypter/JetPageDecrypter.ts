import { decryptRC4 } from "../crypto";
import { isEmptyBuffer } from "../util";
import { createIdentityDecrypter } from "./IdentityDecrypter";
import { PageDecrypter } from "./types";
import { getPageEncodingKey } from "./util";

const KEY_OFFSET = 0x3e; // 62
const KEY_SIZE = 4;

export function createJetPageDecrypter(databaseDefinitionPage: Buffer): PageDecrypter {
    const encodingKey = databaseDefinitionPage.slice(KEY_OFFSET, KEY_OFFSET + KEY_SIZE);

    if (isEmptyBuffer(encodingKey)) {
        return createIdentityDecrypter();
    }

    return (pageBuffer, pageIndex) => {
        const pagekey = getPageEncodingKey(encodingKey, pageIndex);
        return decryptRC4(pagekey, pageBuffer);
    };
}
