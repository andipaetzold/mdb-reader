import { decrypt } from "./decrypt";
import { getJetFormat, JetFormat } from "./JetFormat";
import { createPageDecoder } from "./PageDecoder";
import { PageDecoder } from "./PageDecoder/types";
import PageType, { assertPageType } from "./PageType";

const ENCODING_OFFSET = 0x18;
const ENCODING_KEY = Buffer.from([0xc7, 0xda, 0x39, 0x6b]); // or reverse?

export default class Database {
    public readonly format: JetFormat;

    private readonly pageDecoder: PageDecoder;

    public constructor(private readonly buffer: Buffer, password?: string) {
        assertPageType(this.buffer, PageType.DatabaseDefinitionPage);
        this.format = getJetFormat(this.buffer);

        // decode database definition page
        const decodedBuffer = decrypt(
            this.buffer.slice(ENCODING_OFFSET, ENCODING_OFFSET + this.format.databaseDefinitionPage.decryptedSize),
            ENCODING_KEY
        );
        decodedBuffer.copy(this.buffer, ENCODING_OFFSET);

        this.pageDecoder = createPageDecoder(buffer);
    }

    public getPage(pageIndex: number): Buffer {
        const offset = pageIndex * this.format.pageSize;

        if (this.buffer.length < offset) {
            throw new Error(`Page ${pageIndex} does not exist`);
        }

        const pageBuffer = this.buffer.slice(offset, offset + this.format.pageSize);
        if (pageIndex === 0) {
            return pageBuffer;
        }

        return this.pageDecoder(pageBuffer, pageIndex);
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
        const rco = this.format.dataPage.recordCountOffset;

        if (row > 1000) {
            throw new Error("Cannot read rows > 1000"); // TODO: why?
        }

        const start = pageBuffer.readUInt16LE(rco + 2 + row * 2);
        const nextStart = row === 0 ? this.format.pageSize : pageBuffer.readUInt16LE(rco + row * 2);

        return pageBuffer.slice(start, nextStart);
    }
}
