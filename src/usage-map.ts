import { getBitmapValue } from "./util.js";
import { Database } from "./Database.js";
import { PageType, assertPageType } from "./PageType.js";

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L556-L622
 */
export async function findMapPages(buffer: Buffer, database: Database): Promise<number[]> {
    switch (buffer[0]) {
        case 0x00:
            return findMapPages0(buffer);
        case 0x01:
            return await findMapPages1(buffer, database);
        default:
            throw new Error("Unknown usage map type");
    }
}

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/map.c#L25-L43
 */
function findMapPages0(buffer: Buffer): number[] {
    const pageStart = buffer.readUInt32LE(1);
    const bitmap = buffer.slice(5);
    return getPagesFromBitmap(bitmap, pageStart);
}

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/map.c#L44-L84
 */
async function findMapPages1(buffer: Buffer, database: Database): Promise<number[]> {
    const bitmapLength = (database.format.pageSize - 4) * 8;
    const mapCount = Math.floor((buffer.length - 1) / 4);

    const pages: number[] = [];
    for (let mapIndex = 0; mapIndex < mapCount; ++mapIndex) {
        const page = buffer.readUInt32LE(1 + mapIndex * 4);
        if (page === 0) {
            continue;
        }

        const pageBuffer = await database.getPage(page);
        assertPageType(pageBuffer, PageType.PageUsageBitmaps);

        const bitmap = pageBuffer.slice(4);
        pages.push(...getPagesFromBitmap(bitmap, mapIndex * bitmapLength));
    }

    return pages;
}

function getPagesFromBitmap(bitmap: Buffer, pageStart: number): number[] {
    const pages: number[] = [];

    for (let i = 0; i < bitmap.length * 8; i++) {
        if (getBitmapValue(bitmap, i)) {
            pages.push(pageStart + i);
        }
    }

    return pages;
}
