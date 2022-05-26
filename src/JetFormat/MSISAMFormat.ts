import { jet4Format } from "./Jet4Format.js";
import { CodecType, JetFormat } from "./types.js";

export const msisamFormat: JetFormat = {
    ...jet4Format,
    codecType: CodecType.MSISAM,
};
