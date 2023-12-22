import type { CodecHandler } from "./index.js";
import { getJetFormat } from "../JetFormat/index.js";
import { CodecType } from "../JetFormat/types.js";
import { createIdentityHandler } from "./handlers/identity.js";
import { createJetCodecHandler } from "./handlers/jet.js";
import { createOfficeCodecHandler } from "./handlers/office/index.js";

export async function createCodecHandler(databaseDefinitionPage: Buffer, password: string): Promise<CodecHandler> {
    const format = getJetFormat(databaseDefinitionPage);
    switch (format.codecType) {
        case CodecType.JET:
            return createJetCodecHandler(databaseDefinitionPage);

        case CodecType.OFFICE:
            return await createOfficeCodecHandler(databaseDefinitionPage, password);

        default:
            return createIdentityHandler();
    }
}
