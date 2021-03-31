export type Format = "Jet3" | "Jet4";

/**
 * Returns the database format of the given buffer
 *
 * @param buffer Full buffer or buffer of first page
 *
 * @see https://github.com/mdbtools/mdbtools/blob/master/HACKING.md#database-definition-page
 * @see https://github.com/mdbtools/mdbtools/blob/7d10a50faf3ff89fbb09252c218eb3ca92f5b19c/include/mdbtools.h#L78-L86
 * @see https://github.com/mdbtools/mdbtools/blob/7d10a50faf3ff89fbb09252c218eb3ca92f5b19c/src/libmdb/file.c#L215-L232
 */
export function getFormat(buffer: Buffer): Format {
    switch (buffer[0x14]) {
        case 0x00: // JET 3
            return "Jet3";
        case 0x01: // JET 4
        case 0x02: // ACCESS 2007
        case 0x03: // ACCESS 2010
        case 0x04: // ACCESS 2013
        case 0x05: // ACCESS 2016
        case 0x06: // ACCESS 2019
            return "Jet4";
        default:
            throw new Error("Unsupported database format");
    }
}
