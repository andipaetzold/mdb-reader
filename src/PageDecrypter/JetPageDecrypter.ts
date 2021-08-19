import { decrypt } from "../decrypt";
import { isEmptyBuffer } from "../util";
import { dummyDecrypter } from "./DummyDecrypter";
import { PageDecrypter } from "./types";
import { getPageEncodingKey } from "./util";

// https://github.com/jahlborn/jackcessencrypt/blob/7a6003d9923f793deefa8efc0d7932970347949e/src/main/java/com/healthmarketscience/jackcess/crypt/impl/JetCryptCodecHandler.java

const KEY_OFFSET = 0x3e;
const KEY_SIZE = 4;

export function createJetPageDecrypter(databaseDefinitionPage: Buffer): PageDecrypter {
    const encodingKey = databaseDefinitionPage.slice(KEY_OFFSET, KEY_OFFSET + KEY_SIZE);

    if (isEmptyBuffer(encodingKey)) {
        return dummyDecrypter;
    }

    return (pageBuffer, pageIndex) => {
        const pagekey = getPageEncodingKey(encodingKey, pageIndex);
        return decrypt(pageBuffer, pagekey);
    };
}
