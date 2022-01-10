import { readDateTime } from "./data/datetime";
import { decrypt } from "./decrypt";
import { getJetFormat, JetFormat } from "./JetFormat";
import { createPageDecrypter } from "./PageDecrypter";
import { PageDecrypter } from "./PageDecrypter/types";
import PageType, { assertPageType } from "./PageType";
import { SortOrder } from "./types";
import { uncompressText } from "./unicodeCompression";
import { isEmptyBuffer, xor } from "./util";

const PASSWORD_OFFSET = 0x42;

export default class Database {
    public readonly format: JetFormat;

    private readonly pageDecrypter: PageDecrypter;
    private readonly databaseDefinitionPage: Buffer;

    public constructor(private readonly buffer: Buffer, readonly password: string) {
        assertPageType(this.buffer, PageType.DatabaseDefinitionPage);

        this.format = getJetFormat(this.buffer);

        this.databaseDefinitionPage = Buffer.alloc(this.format.pageSize);
        this.buffer.copy(this.databaseDefinitionPage, 0, 0, this.format.pageSize);
        decryptHeader(this.databaseDefinitionPage, this.format);
        this.pageDecrypter = createPageDecrypter(this.databaseDefinitionPage, password);
    }

    public getPassword(): string | null {
        let passwordBuffer = this.databaseDefinitionPage.slice(
            PASSWORD_OFFSET,
            PASSWORD_OFFSET + this.format.databaseDefinitionPage.passwordSize
        );

        const mask = this.getPasswordMask();
        if (mask !== null) {
            passwordBuffer = xor(passwordBuffer, mask);
        }

        if (isEmptyBuffer(passwordBuffer)) {
            return null;
        }

        let password = uncompressText(passwordBuffer, this.format);
        const nullCharIndex = password.indexOf("\0");
        if (nullCharIndex >= 0) {
            password = password.slice(0, nullCharIndex);
        }
        return password;
    }

    private getPasswordMask(): Buffer | null {
        if (this.format.databaseDefinitionPage.creationDateOffset === null) {
            return null;
        }

        const mask = Buffer.alloc(this.format.databaseDefinitionPage.passwordSize);
        const dateValue = this.databaseDefinitionPage.readDoubleLE(this.format.databaseDefinitionPage.creationDateOffset);
        mask.writeInt32LE(Math.floor(dateValue));
        for (let i = 0; i < mask.length; ++i) {
            mask[i] = mask[i % 4];
        }
        return mask;
    }

    public getCreationDate(): Date | null {
        if (this.format.databaseDefinitionPage.creationDateOffset === null) {
            return null;
        }

        const creationDateBuffer = this.databaseDefinitionPage.slice(
            this.format.databaseDefinitionPage.creationDateOffset,
            this.format.databaseDefinitionPage.creationDateOffset + 8
        );
        return readDateTime(creationDateBuffer);
    }

    public getDefaultSortOrder(): Readonly<SortOrder> {
        const value = this.databaseDefinitionPage.readUInt16LE(
            this.format.databaseDefinitionPage.defaultSortOrder.offset + 3
        );

        if (value === 0) {
            return this.format.defaultSortOrder;
        }

        let version = this.format.defaultSortOrder.version;
        if (this.format.databaseDefinitionPage.defaultSortOrder.size == 4) {
            version = this.databaseDefinitionPage.readUInt8(this.format.databaseDefinitionPage.defaultSortOrder.offset + 3);
        }

        return Object.freeze({ value, version });
    }

    public getPage(page: number): Buffer {
        if (page === 0) {
            // already decrypted
            return this.databaseDefinitionPage;
        }

        const offset = page * this.format.pageSize;
        if (this.buffer.length < offset) {
            throw new Error(`Page ${page} does not exist`);
        }

        const pageBuffer = this.buffer.slice(offset, offset + this.format.pageSize);
        return this.pageDecrypter(pageBuffer, page);
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
