import { getJetFormat, JetFormat } from "../JetFormat";
import { CodecType } from "../JetFormat/types";
import { dummyDecoder } from "./DummyDecoder";
import { createJetPageDecoder } from "./JetPageDecoder";
import { PageDecoder } from "./types";

export function createPageDecoder(databaseDefinitionPage: Buffer): PageDecoder {
    const format = getJetFormat(databaseDefinitionPage);
    switch (format.codecType) {
        case CodecType.JET:
            return createJetPageDecoder(databaseDefinitionPage);

        default:
            // TODO
            return dummyDecoder;
    }
}
