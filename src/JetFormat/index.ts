import { jet12Format } from "./Jet12Format";
import { jet14Format } from "./Jet14Format";
import { jet15Format } from "./Jet15Format";
import { jet16Format } from "./Jet16Format";
import { jet17Format } from "./Jet17Format";
import { jet3Format } from "./Jet3Format";
import { jet4Format } from "./Jet4Format";
import { msisamFormat } from "./MSISAMFormat";
import { JetFormat } from "./types";

export type { JetFormat } from "./types";

const OFFSET_VERSION = 0x14;
const OFFSET_ENGINE_NAME = 0x4;
const MSISAM_ENGINE = Buffer.from("MSISAM Database", "ascii");

/**
 * Returns the database format of the given buffer
 *
 * @param buffer Full buffer or buffer of first page
 *
 * @see https://github.com/mdbtools/mdbtools/blob/master/HACKING.md#database-definition-page
 * @see https://github.com/mdbtools/mdbtools/blob/7d10a50faf3ff89fbb09252c218eb3ca92f5b19c/include/mdbtools.h#L78-L86
 * @see https://github.com/mdbtools/mdbtools/blob/7d10a50faf3ff89fbb09252c218eb3ca92f5b19c/src/libmdb/file.c#L215-L232
 * @see https://github.com/jahlborn/jackcess/blob/a61e2da7fe9f76614013481c27a557455f080752/src/main/java/com/healthmarketscience/jackcess/impl/JetFormat.java
 */
export function getJetFormat(buffer: Buffer): JetFormat {
    const version = buffer[OFFSET_VERSION];
    switch (version) {
        case 0x00: // JET 3
            return jet3Format;
        case 0x01: // JET 4
            if (buffer.slice(OFFSET_ENGINE_NAME, OFFSET_ENGINE_NAME + MSISAM_ENGINE.length).equals(MSISAM_ENGINE)) {
                return msisamFormat;
            }

            return jet4Format;
        case 0x02: // ACCESS 2007
            return jet12Format;
        case 0x03: // ACCESS 2010
            return jet14Format;
        case 0x04: // ACCESS 2013
            return jet15Format;
        case 0x05: // ACCESS 2016
            return jet16Format;
        case 0x06: // ACCESS 2019
            return jet17Format;
        default:
            throw new Error(`Unsupported version '${version}'`);
    }
}
