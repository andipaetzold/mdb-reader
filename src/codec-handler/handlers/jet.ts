import { CodecHandler } from "..";
import { decryptRC4 } from "../../crypto";
import { isEmptyBuffer } from "../../util";
import { createIdentityHandler } from "./identity";
import { DecryptPage } from "../types";
import { getPageEncodingKey } from "../util";

const KEY_OFFSET = 0x3e; // 62
const KEY_SIZE = 4;

export function createJetCodecHandler(databaseDefinitionPage: Buffer): CodecHandler {
    const encodingKey = databaseDefinitionPage.slice(KEY_OFFSET, KEY_OFFSET + KEY_SIZE);

    if (isEmptyBuffer(encodingKey)) {
        return createIdentityHandler();
    }

    const decryptPage: DecryptPage = (pageBuffer, pageIndex) => {
        const pagekey = getPageEncodingKey(encodingKey, pageIndex);
        return decryptRC4(pagekey, pageBuffer);
    };

    return {
        decryptPage,
        verifyPassword: () => true, // TODO
    };
}
