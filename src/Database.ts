import { Constants, getConstants } from "./constants";
import PageType, { assertPageType } from "./PageType";

export default class Database {
    public readonly constants: Constants;

    public constructor(private readonly buffer: Buffer) {
        assertPageType(this.buffer, PageType.DatabaseDefinitionPage);

        this.constants = getConstants(this.buffer);
    }

    public getPage(page: number): Buffer {
        const offset = page * this.constants.pageSize;

        if (this.buffer.length < offset) {
            throw new Error(`Page ${page} does not exist`);
        }

        return this.buffer.slice(offset, offset + this.constants.pageSize);
    }

    /**
     * @param pageRow Lower byte contains the row number, the upper three contain page
     *
     * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L102-L124
     */
    public findPageRow(pageRow: number): Buffer {
        const page = pageRow >> 8;
        const row = pageRow & 0xff;

        const pageBuffer = this.getPage(page);
        return this.findRow(pageBuffer, row);
    }

    /**
     * @param pageBuffer Buffer of a data page
     *
     * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L126-L138
     */
    public findRow(pageBuffer: Buffer, row: number): Buffer {
        const rco = this.constants.dataPage.rowCountOffset;

        if (row > 1000) {
            throw new Error("Cannot read rows > 1000"); // TODO: why?
        }

        const start = pageBuffer.readUInt16LE(rco + 2 + row * 2);
        const nextStart =
            row === 0
                ? this.constants.pageSize
                : pageBuffer.readUInt16LE(rco + row * 2);

        return pageBuffer.slice(start, nextStart);
    }
}
