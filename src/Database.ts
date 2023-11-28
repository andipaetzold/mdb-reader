import { CodecHandler, createCodecHandler } from "./codec-handler/index.js";
import { decryptRC4 } from "./crypto/index.js";
import { readDateTime } from "./data/datetime.js";
import { getJetFormat, JetFormat } from "./JetFormat/index.js";
import { PageType, assertPageType } from "./PageType.js";
import { SortOrder } from "./types.js";
import { uncompressText } from "./unicodeCompression.js";
import { isEmptyBuffer, xor } from "./util.js";

const PASSWORD_OFFSET = 0x42;

export class Database {
    #buffer: Buffer;
    #format: JetFormat;

    #codecHandler: CodecHandler;
    #databaseDefinitionPage: Buffer;

    constructor(buffer: Buffer, password: string) {
        this.#buffer = buffer;

        assertPageType(this.#buffer, PageType.DatabaseDefinitionPage);

        this.#format = getJetFormat(this.#buffer);

        this.#databaseDefinitionPage = Buffer.alloc(this.#format.pageSize);
        this.#buffer.copy(this.#databaseDefinitionPage, 0, 0, this.#format.pageSize);
        decryptHeader(this.#databaseDefinitionPage, this.#format);
        this.#codecHandler = createCodecHandler(this.#databaseDefinitionPage, password);

        if (!this.#codecHandler.verifyPassword()) {
            throw new Error("Wrong password");
        }
    }

    get format(): JetFormat {
        return this.#format;
    }

    getPassword(): string | null {
        let passwordBuffer = this.#databaseDefinitionPage.slice(
            PASSWORD_OFFSET,
            PASSWORD_OFFSET + this.#format.databaseDefinitionPage.passwordSize
        );

        const mask = this.#getPasswordMask();
        if (mask !== null) {
            passwordBuffer = xor(passwordBuffer, mask);
        }

        if (isEmptyBuffer(passwordBuffer)) {
            return null;
        }

        let password = uncompressText(passwordBuffer, this.#format);
        const nullCharIndex = password.indexOf("\0");
        if (nullCharIndex >= 0) {
            password = password.slice(0, nullCharIndex);
        }
        return password;
    }

    #getPasswordMask(): Buffer | null {
        if (this.#format.databaseDefinitionPage.creationDateOffset === null) {
            return null;
        }

        const mask = Buffer.alloc(this.#format.databaseDefinitionPage.passwordSize);
        const dateValue = this.#databaseDefinitionPage.readDoubleLE(this.#format.databaseDefinitionPage.creationDateOffset);
        mask.writeInt32LE(Math.floor(dateValue));
        for (let i = 0; i < mask.length; ++i) {
            mask[i] = mask[i % 4]!;
        }
        return mask;
    }

    getCreationDate(): Date | null {
        if (this.#format.databaseDefinitionPage.creationDateOffset === null) {
            return null;
        }

        const creationDateBuffer = this.#databaseDefinitionPage.slice(
            this.#format.databaseDefinitionPage.creationDateOffset,
            this.#format.databaseDefinitionPage.creationDateOffset + 8
        );
        return readDateTime(creationDateBuffer);
    }

    getDefaultSortOrder(): Readonly<SortOrder> {
        const value = this.#databaseDefinitionPage.readUInt16LE(
            this.#format.databaseDefinitionPage.defaultSortOrder.offset + 3
        );

        if (value === 0) {
            return this.#format.defaultSortOrder;
        }

        let version = this.#format.defaultSortOrder.version;
        if (this.#format.databaseDefinitionPage.defaultSortOrder.size == 4) {
            version = this.#databaseDefinitionPage.readUInt8(
                this.#format.databaseDefinitionPage.defaultSortOrder.offset + 3
            );
        }

        return Object.freeze({ value, version });
    }

    getPage(page: number): Buffer {
        if (page === 0) {
            // already decrypted
            return this.#databaseDefinitionPage;
        }

        const offset = page * this.#format.pageSize;
        if (this.#buffer.length < offset) {
            throw new Error(`Page ${page} does not exist`);
        }

        const pageBuffer = this.#buffer.slice(offset, offset + this.#format.pageSize);
        return this.#codecHandler.decryptPage(pageBuffer, page);
    }

    /**
     * @param pageRow Lower byte contains the row number, the upper three contain page
     *
     * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L102-L124
     */
    findPageRow(pageRow: number): Buffer {
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
    findRow(pageBuffer: Buffer, row: number): Buffer {
        const rco = this.#format.dataPage.recordCountOffset;

        if (row > 1000) {
            throw new Error("Cannot read rows > 1000"); // TODO: why?
        }

        const start = pageBuffer.readUInt16LE(rco + 2 + row * 2);
        const nextStart = row === 0 ? this.#format.pageSize : pageBuffer.readUInt16LE(rco + row * 2);

        return pageBuffer.slice(start, nextStart);
    }
}

const ENCRYPTION_START = 0x18;
const ENCRYPTION_KEY = [0xc7, 0xda, 0x39, 0x6b];
function decryptHeader(buffer: Buffer, format: JetFormat): void {
    const decryptedBuffer = decryptRC4(
        Buffer.from(ENCRYPTION_KEY),
        buffer.slice(ENCRYPTION_START, ENCRYPTION_START + format.databaseDefinitionPage.encryptedSize)
    );
    decryptedBuffer.copy(buffer, ENCRYPTION_START);
}
