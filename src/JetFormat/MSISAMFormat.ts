import { jet4Format } from "./Jet4Format";
import { CodecType, JetFormat } from "./types";

export const msisamFormat: JetFormat = {
    ...jet4Format,
    codecType: CodecType.MSISAM,
};
