export type Format = "Jet3" | "Jet4";

/**
 * Returns the database format of the given buffer
 *
 * @param buffer Full buffer or buffer of first page
 *
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L83-L85
 * @see https://github.com/cyberemissary/mdbtools/blob/a6c3fa26b8408d459966465077c5bd71072739e8/include/mdbtools.h#L67-L74
 * @see https://github.com/cyberemissary/mdbtools/blob/a6c3fa26b8408d459966465077c5bd71072739e8/src/libmdb/file.c#L224-L240
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
            return "Jet4";
        default:
            throw new Error("Unsupported database format");
    }
}
