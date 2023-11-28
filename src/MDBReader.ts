import { Database } from "./Database.js";
import { PageType, assertPageType } from "./PageType.js";
import { type SysObject, isSysObjectType, isSystemObject, SysObjectTypes } from "./SysObject.js";
import { Table } from "./Table.js";
import type { SortOrder } from "./types.js";

const MSYS_OBJECTS_TABLE = "MSysObjects";
const MSYS_OBJECTS_PAGE = 2;

export interface Options {
    password?: string | undefined;
}

export default class MDBReader {
    #buffer: Buffer;
    #sysObjects: SysObject[];
    #database: Database;

    /**
     * @param buffer Buffer of the database.
     */
    constructor(buffer: Buffer, { password }: Options | undefined = {}) {
        this.#buffer = buffer;

        assertPageType(this.#buffer, PageType.DatabaseDefinitionPage);

        this.#database = new Database(this.#buffer, password ?? "");

        const mSysObjectsTable = new Table(MSYS_OBJECTS_TABLE, this.#database, MSYS_OBJECTS_PAGE).getData<{
            Id: number;
            Name: string;
            Type: number;
            Flags: number;
        }>({
            columns: ["Id", "Name", "Type", "Flags"],
        });

        this.#sysObjects = mSysObjectsTable.map((mSysObject) => {
            const objectType = mSysObject.Type & 0x7f;
            return {
                objectName: mSysObject.Name,
                objectType: isSysObjectType(objectType) ? objectType : null,
                tablePage: mSysObject.Id & 0x00ffffff,
                flags: mSysObject.Flags,
            };
        });
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
    getTableNames({
        normalTables = true,
        systemTables = false,
        linkedTables = false,
    }: {
        normalTables?: boolean | undefined;
        systemTables?: boolean | undefined;
        linkedTables?: boolean | undefined;
    } = {}): string[] {
        const filteredSysObjects: SysObject[] = [];
        for (const sysObject of this.#sysObjects) {
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
    getTable(name: string): Table {
        const sysObject = this.#sysObjects
            .filter((o) => o.objectType === SysObjectTypes.Table)
            .find((o) => o.objectName === name);

        if (!sysObject) {
            throw new Error(`Could not find table with name ${name}`);
        }

        return new Table(name, this.#database, sysObject.tablePage);
    }
}
