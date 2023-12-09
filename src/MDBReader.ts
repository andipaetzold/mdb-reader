import { createDatabase } from "./Database.js";
import { PageType, assertPageType } from "./PageType.js";
import { createTable } from "./Table.js";
import { type SysObject, isSysObject, SysObjectTypes, getSysObjects } from "./SysObject.js";
import type { MDBReader, SortOrder, Table } from "./types.js";

export interface Options {
    password?: string | undefined;
}

export async function createMDBReader(buffer: Buffer, { password }: Options | undefined = {}): Promise<MDBReader> {
    assertPageType(buffer, PageType.DatabaseDefinitionPage);

    const database = await createDatabase(buffer, password ?? "");
    await database.verifyPassword();
    const sysObjects = await getSysObjects(database);

    return {
        getCreationDate(): Date | null {
            return database.getCreationDate();
        },
        getPassword(): string | null {
            return database.getPassword();
        },

        getDefaultSortOrder(): SortOrder {
            return database.getDefaultSortOrder();
        },

        async getTableNames({
            normalTables = true,
            systemTables = false,
            linkedTables = false,
        }: {
            normalTables?: boolean | undefined;
            systemTables?: boolean | undefined;
            linkedTables?: boolean | undefined;
        } = {}): Promise<string[]> {
            const filteredSysObjects: SysObject[] = [];
            for (const sysObject of sysObjects) {
                switch (sysObject.objectType) {
                    case SysObjectTypes.Table: {
                        if ((isSysObject(sysObject) && systemTables) || (!isSysObject(sysObject) && normalTables)) {
                            filteredSysObjects.push(sysObject);
                        }
                        break;
                    }

                    case SysObjectTypes.LinkedTable: {
                        if (linkedTables) {
                            filteredSysObjects.push(sysObject);
                        }
                        break;
                    }
                }
            }

            return filteredSysObjects.map((o) => o.objectName);
        },

        async getTable(name: string): Promise<Table> {
            const sysObject = sysObjects
                .filter((o) => o.objectType === SysObjectTypes.Table)
                .find((o) => o.objectName === name);

            if (!sysObject) {
                throw new Error(`Could not find table with name ${name}`);
            }

            return await createTable(name, database, sysObject.tablePage);
        },
    };
}
