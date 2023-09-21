import { Database } from "./Database.js";
import { PageType, assertPageType } from "./PageType.js";
import { SysObject, isSysObjectType, isSystemObject, SysObjectTypes } from "./SysObject.js";
import { createTable } from "./Table.js";
import { SortOrder, Table } from "./types.js";

const MSYS_OBJECTS_TABLE = "MSysObjects";
const MSYS_OBJECTS_PAGE = 2;

export interface Options {
    password?: string;
}

export default class MDBReader {
    #buffer: Buffer;
    #sysObjectsPromise: Promise<SysObject[]>;
    #database: Database;

    /**
     * @param buffer Buffer of the database.
     */
    constructor(buffer: Buffer, { password }: Options = {}) {
        this.#buffer = buffer;

        assertPageType(this.#buffer, PageType.DatabaseDefinitionPage);

        this.#database = new Database(this.#buffer, password ?? "");

        this.#sysObjectsPromise = getSysObjects(this.#database);
    }

    /**
     * Date when the database was created
     */
    getCreationDate(): Date | null {
        return this.#database.getCreationDate();
    }

    /**
     * Database password
     */
    getPassword(): string | null {
        return this.#database.getPassword();
    }

    /**
     * Default sort order
     */
    getDefaultSortOrder(): Readonly<SortOrder> {
        return this.#database.getDefaultSortOrder();
    }

    /**
     * Returns an array of table names.
     *
     * @param normalTables Includes user tables. Default true.
     * @param systemTables Includes system tables. Default false.
     * @param linkedTables Includes linked tables. Default false.
     */
    async getTableNames(
        {
            normalTables,
            systemTables,
            linkedTables,
        }: {
            normalTables: boolean;
            systemTables: boolean;
            linkedTables: boolean;
        } = { normalTables: true, systemTables: false, linkedTables: false }
    ): Promise<string[]> {
        const sysObjects = await this.#sysObjectsPromise;
        const filteredSysObjects: SysObject[] = [];
        for (const sysObject of sysObjects) {
            if (sysObject.objectType === SysObjectTypes.Table) {
                if (!isSystemObject(sysObject)) {
                    if (normalTables) {
                        filteredSysObjects.push(sysObject);
                    }
                } else if (systemTables) {
                    filteredSysObjects.push(sysObject);
                }
            } else if (sysObject.objectType === SysObjectTypes.LinkedTable && linkedTables) {
                filteredSysObjects.push(sysObject);
            }
        }

        return filteredSysObjects.map((o) => o.objectName);
    }

    /**
     * Returns a table by its name.
     *
     * @param name Name of the table. Case sensitive.
     */
    async getTable(name: string): Promise<Table> {
        const sysObjects = await this.#sysObjectsPromise;
        const sysObject = sysObjects.filter((o) => o.objectType === SysObjectTypes.Table).find((o) => o.objectName === name);

        if (!sysObject) {
            throw new Error(`Could not find table with name ${name}`);
        }

        return await createTable(name, this.#database, sysObject.tablePage);
    }
}

async function getSysObjects(database: Database): Promise<SysObject[]> {
    const table = await createTable(MSYS_OBJECTS_TABLE, database, MSYS_OBJECTS_PAGE);
    const tableData = await table.getData<{
        Id: number;
        Name: string;
        Type: number;
        Flags: number;
    }>({
        columns: ["Id", "Name", "Type", "Flags"],
    });

    return tableData.map((mSysObject) => {
        const objectType = mSysObject.Type & 0x7f;
        return {
            objectName: mSysObject.Name,
            objectType: isSysObjectType(objectType) ? objectType : null,
            tablePage: mSysObject.Id & 0x00ffffff,
            flags: mSysObject.Flags,
        };
    });
}
