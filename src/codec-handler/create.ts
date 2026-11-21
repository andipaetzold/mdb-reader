import type { Environment } from "../environment/types.js";
import { getJetFormat } from "../JetFormat/index.js";
import { CodecType } from "../JetFormat/types.js";
import { createIdentityHandler } from "./handlers/identity.js";
import { createJetCodecHandler } from "./handlers/jet.js";
import { createOfficeCodecHandler } from "./handlers/office/index.js";
import type { CodecHandler } from "./types.js";

export function createCodecHandler(
    environment: Environment,
    databaseDefinitionPage: Buffer,
    password: string,
): CodecHandler {
    const format = getJetFormat(databaseDefinitionPage);
    switch (format.codecType) {
        case CodecType.JET:
            return createJetCodecHandler(databaseDefinitionPage);

        case CodecType.OFFICE:
            return createOfficeCodecHandler(environment, databaseDefinitionPage, password);

        default:
            return createIdentityHandler();
    }
}
