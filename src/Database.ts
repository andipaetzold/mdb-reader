import { createCodecHandler } from "./codec-handler/index.js";
import { decryptRC4 } from "./crypto/index.js";
import { readDateTime } from "./data/datetime.js";
import { getJetFormat, type JetFormat } from "./JetFormat/index.js";
import { assertPageType, PageType } from "./PageType.js";
import type { SortOrder } from "./types.js";
import { uncompressText } from "./unicodeCompression.js";
import { isEmptyBuffer, xor } from "./util.js";

const PASSWORD_OFFSET = 0x42;

export type Database = Awaited<ReturnType<typeof createDatabase>>;

export async function createDatabase(buffer: Buffer, password: string) {
    assertPageType(buffer, PageType.DatabaseDefinitionPage);

    const format = getJetFormat(buffer);

    const databaseDefinitionPage = Buffer.alloc(format.pageSize);
    buffer.copy(databaseDefinitionPage, 0, 0, format.pageSize);
    decryptHeader(databaseDefinitionPage, format);
    const codecHandler = createCodecHandler(databaseDefinitionPage, password);

    async function getPage(page: number): Promise<Buffer> {
        if (page === 0) {
            // already decrypted
            return databaseDefinitionPage;
        }

        const offset = page * format.pageSize;
        if (buffer.length < offset) {
            throw new Error(`Page ${page} does not exist`);
        }

        const pageBuffer = buffer.slice(offset, offset + format.pageSize);
        return await codecHandler.decryptPage(pageBuffer, page);
    }

    return {
        format,
        async verifyPassword(): Promise<boolean> {
            return await codecHandler.verifyPassword();
        },
        getPassword(): string | null {
            let passwordBuffer = databaseDefinitionPage.slice(
                PASSWORD_OFFSET,
                PASSWORD_OFFSET + format.databaseDefinitionPage.passwordSize
            );

            const mask = getPasswordMask(databaseDefinitionPage, format);
            if (mask !== null) {
                passwordBuffer = xor(passwordBuffer, mask);
            }

            if (isEmptyBuffer(passwordBuffer)) {
                return null;
            }

            let password = uncompressText(passwordBuffer, format);
            const nullCharIndex = password.indexOf("\0");
            if (nullCharIndex >= 0) {
                password = password.slice(0, nullCharIndex);
            }
            return password;
        },
        getCreationDate(): Date | null {
            if (format.databaseDefinitionPage.creationDateOffset === null) {
                return null;
            }

            const creationDateBuffer = databaseDefinitionPage.slice(
                format.databaseDefinitionPage.creationDateOffset,
                format.databaseDefinitionPage.creationDateOffset + 8
            );
            return readDateTime(creationDateBuffer);
        },

        getDefaultSortOrder(): SortOrder {
            const value = databaseDefinitionPage.readUInt16LE(format.databaseDefinitionPage.defaultSortOrder.offset + 3);

            if (value === 0) {
                return format.defaultSortOrder;
            }

            let version = format.defaultSortOrder.version;
            if (format.databaseDefinitionPage.defaultSortOrder.size == 4) {
                version = databaseDefinitionPage.readUInt8(format.databaseDefinitionPage.defaultSortOrder.offset + 3);
            }

            return { value, version };
        },
        getPage,

        /**
         * @param pageRow Lower byte contains the row number, the upper three contain page
         *
         * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L102-L124
         */
        async findPageRow(pageRow: number): Promise<Buffer> {
            const page = pageRow >> 8;
            const row = pageRow & 0xff;

            const pageBuffer = await getPage(page);
            return findRow(pageBuffer, row, format);
        },
    };
}

function getPasswordMask(databaseDefinitionPage: Buffer, format: JetFormat): Buffer | null {
    if (format.databaseDefinitionPage.creationDateOffset === null) {
        return null;
    }

    const mask = Buffer.alloc(format.databaseDefinitionPage.passwordSize);
    const dateValue = databaseDefinitionPage.readDoubleLE(format.databaseDefinitionPage.creationDateOffset);
    mask.writeInt32LE(Math.floor(dateValue));
    for (let i = 0; i < mask.length; ++i) {
        mask[i] = mask[i % 4]!;
    }
    return mask;
}

/**
 * @param pageBuffer Buffer of a data page
 *
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L126-L138
 */
function findRow(pageBuffer: Buffer, row: number, format: JetFormat): Buffer {
    const rco = format.dataPage.recordCountOffset;

    if (row > 1000) {
        throw new Error("Cannot read rows > 1000"); // TODO: why?
    }

    const start = pageBuffer.readUInt16LE(rco + 2 + row * 2);
    const nextStart = row === 0 ? format.pageSize : pageBuffer.readUInt16LE(rco + row * 2);

    return pageBuffer.slice(start, nextStart);
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
