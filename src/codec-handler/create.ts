import { CodecHandler } from ".";
import { getJetFormat } from "../JetFormat";
import { CodecType } from "../JetFormat/types";
import { createIdentityHandler } from "./handlers/identity";
import { createJetCodecHandler } from "./handlers/jet";
import { createOfficeCodecHandler } from "./handlers/office";

export function createCodecHandler(databaseDefinitionPage: Buffer, password: string): CodecHandler {
    const format = getJetFormat(databaseDefinitionPage);
    switch (format.codecType) {
        case CodecType.JET:
            return createJetCodecHandler(databaseDefinitionPage);

        case CodecType.OFFICE:
            return createOfficeCodecHandler(databaseDefinitionPage, password);

        default:
            return createIdentityHandler();
    }
}
