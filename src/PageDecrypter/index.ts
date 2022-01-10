import { getJetFormat } from "../JetFormat";
import { CodecType } from "../JetFormat/types";
import { createIdentityDecrypter } from "./IdentityDecrypter";
import { createJetPageDecrypter } from "./JetPageDecrypter";
import { PageDecrypter } from "./types";

export function createPageDecrypter(databaseDefinitionPage: Buffer, _password: string): PageDecrypter {
    const format = getJetFormat(databaseDefinitionPage);
    switch (format.codecType) {
        case CodecType.JET:
            return createJetPageDecrypter(databaseDefinitionPage);

        default:
            return createIdentityDecrypter();
    }
}
