import { Constants, getConstants } from "./constants";
import { readDateTime } from "./data";
import { decrypt } from "./decrypt";
import PageType, { assertPageType } from "./PageType";
import { numberToBuffer, xor } from "./util";

const ENCRYPTION_START = 0x18;
const ENCRYPTION_KEY = Buffer.from([0xc7, 0xda, 0x39, 0x6b]); // or reverse?

const SYSTEM_CODE_PAGE_OFFSET = 0x3c;

const KEY_OFFSET = 0x3e;
const KEY_SIZE = 4;

/**
 * Jet 3 only
 */
const PASSWORD_OFFSET = 0x42;

const CREATION_DATE_OFFSET = 0x72;

export default class Database {
    public readonly constants: Constants;

    private readonly key: Buffer;
    private readonly password: Buffer;

    private readonly defaultCollation: number;
    private readonly systemCodePage: number;

    private readonly creationDate: Date;

    public constructor(private readonly buffer: Buffer, password?: string) {
        assertPageType(this.buffer, PageType.DatabaseDefinitionPage);
        this.constants = getConstants(this.buffer);

        // decrypt page
        const decryptedBuffer = decrypt(
            this.buffer.slice(ENCRYPTION_START, ENCRYPTION_START + this.constants.databaseDefinitionPage.decryptedSize),
            ENCRYPTION_KEY
        );
        decryptedBuffer.copy(this.buffer, ENCRYPTION_START);

        // read data from decrypted page
        this.defaultCollation = this.buffer.readUIntLE(
            this.constants.databaseDefinitionPage.defaultCollation.offset,
            this.constants.databaseDefinitionPage.defaultCollation.size
        );
        this.systemCodePage = this.buffer.readUInt16LE(SYSTEM_CODE_PAGE_OFFSET);

        this.key = this.buffer.slice(KEY_OFFSET, KEY_OFFSET + KEY_SIZE);

        this.creationDate = readDateTime(this.buffer.slice(CREATION_DATE_OFFSET));

        this.password = this.buffer.slice(PASSWORD_OFFSET, PASSWORD_OFFSET + 14);
        if (this.constants.format === "Jet4") {
            this.password = xor(this.password, this.buffer.slice(CREATION_DATE_OFFSET, CREATION_DATE_OFFSET + 8));
        }
    }

    public getPage(page: number): Buffer {
        const offset = page * this.constants.pageSize;

        if (this.buffer.length < offset) {
            throw new Error(`Page ${page} does not exist`);
        }

        const pageBuffer = this.buffer.slice(offset, offset + this.constants.pageSize);

        if (page === 0 || this.key.every((v) => v === 0)) {
            // no encryption
            return pageBuffer;
        }

        const pageIndexBuffer = Buffer.alloc(4);
        pageIndexBuffer.writeUInt32LE(page);

        const pagekey = xor(pageIndexBuffer, this.key);
        return decrypt(pageBuffer, pagekey);
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
        const rco = this.constants.dataPage.recordCountOffset;

        if (row > 1000) {
            throw new Error("Cannot read rows > 1000"); // TODO: why?
        }

        const start = pageBuffer.readUInt16LE(rco + 2 + row * 2);
        const nextStart = row === 0 ? this.constants.pageSize : pageBuffer.readUInt16LE(rco + row * 2);

        return pageBuffer.slice(start, nextStart);
    }
}
