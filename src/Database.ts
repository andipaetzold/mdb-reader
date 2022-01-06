import { readDateTime } from "./data/datetime";
import { decrypt } from "./decrypt";
import { getJetFormat, JetFormat } from "./JetFormat";
import PageType, { assertPageType } from "./PageType";

const CREATION_DATE_OFFSET = 0x72; // 114

export default class Database {
    public readonly format: JetFormat;

    public readonly creationDate: Date;

    public constructor(private readonly buffer: Buffer) {
        assertPageType(this.buffer, PageType.DatabaseDefinitionPage);

        this.format = getJetFormat(this.buffer);
        decryptHeader(this.buffer, this.format);

        const creationDateBuffer = this.buffer.slice(CREATION_DATE_OFFSET, CREATION_DATE_OFFSET + 8);
        this.creationDate = readDateTime(creationDateBuffer);
    }

    public getPage(page: number): Buffer {
        const offset = page * this.format.pageSize;

        if (this.buffer.length < offset) {
            throw new Error(`Page ${page} does not exist`);
        }

        return this.buffer.slice(offset, offset + this.format.pageSize);
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

const ENCRYPTION_START = 0x18;
const ENCRYPTION_KEY = Buffer.from([0xc7, 0xda, 0x39, 0x6b]);
function decryptHeader(buffer: Buffer, format: JetFormat): void {
    const decryptedBuffer = decrypt(
        buffer.slice(ENCRYPTION_START, ENCRYPTION_START + format.databaseDefinitionPage.encryptedSize),
        ENCRYPTION_KEY
    );
    decryptedBuffer.copy(buffer, ENCRYPTION_START);
}
