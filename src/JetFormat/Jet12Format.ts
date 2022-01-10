import { jet4Format } from "./Jet4Format";
import { CodecType, JetFormat } from "./types";

export const jet12Format: JetFormat = {
    ...jet4Format,
    codecType: CodecType.OFFICE,
};