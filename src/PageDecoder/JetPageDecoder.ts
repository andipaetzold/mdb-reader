import { decrypt } from "../decrypt";
import { isEmptyBuffer, xor } from "../util";
import { dummyDecoder } from "./DummyDecoder";
import { PageDecoder } from "./types";

// https://github.com/jahlborn/jackcessencrypt/blob/7a6003d9923f793deefa8efc0d7932970347949e/src/main/java/com/healthmarketscience/jackcess/crypt/impl/JetCryptCodecHandler.java

const KEY_OFFSET = 0x3e;
const KEY_SIZE = 4;

export function createJetPageDecoder(databaseDefinitionPage: Buffer): PageDecoder {
    const encodingKey = databaseDefinitionPage.slice(KEY_OFFSET, KEY_OFFSET + KEY_SIZE);

    if (isEmptyBuffer(encodingKey)) {
        return dummyDecoder;
    }

    return (pageBuffer, pageIndex) => {
        const pageIndexBuffer = Buffer.alloc(4);
        pageIndexBuffer.writeUInt32LE(pageIndex);

        const pagekey = xor(pageIndexBuffer, encodingKey);

        return decrypt(pageBuffer, pagekey);
    };
}
