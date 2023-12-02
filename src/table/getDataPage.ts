import { Database } from "../Database.js";
import { PageType, assertPageType } from "../PageType.js";

export async function getDataPage(name: string, database: Database, firstDefinitionPage: number, page: number) {
    const pageBuffer = await database.getPage(page);
    assertPageType(pageBuffer, PageType.DataPage);

    if (pageBuffer.readUInt32LE(4) !== firstDefinitionPage) {
        throw new Error(`Data page ${page} does not belong to table ${name}`);
    }

    return pageBuffer;
}
