import { getJetFormat, JetFormat } from "../JetFormat";
import { CodecType } from "../JetFormat/types";
import { dummyDecrypter } from "./DummyDecrypter";
import { createJetPageDecrypter } from "./JetPageDecrypter";
import { createOfficePageDecrypter } from "./OfficeDecrypter";
import { PageDecrypter } from "./types";

export function createPageDecrypter(databaseDefinitionPage: Buffer, password?: string): PageDecrypter {
    const format = getJetFormat(databaseDefinitionPage);
    switch (format.codecType) {
        case CodecType.JET:
            return createJetPageDecrypter(databaseDefinitionPage);

        case CodecType.OFFICE:
            return createOfficePageDecrypter(databaseDefinitionPage, password);

        default:
            // TODO
            return dummyDecrypter;
    }
}
