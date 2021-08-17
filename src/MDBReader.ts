import Database from "./Database";
import { LegacyFormat } from "./JetFormat";
import PageType, { assertPageType } from "./PageType";
import SysObject, { isSysObjectType, isSystemObject, SysObjectType } from "./SysObject";
import Table from "./Table";

const MSYS_OBJECTS_TABLE = "MSysObjects";
const MSYS_OBJECTS_PAGE = 2;

export interface Options {
    password?: string;
}

export default class MDBReader {
    private readonly sysObjects: SysObject[];
    private readonly db: Database;

    /**
     * @param buffer Buffer of the database.
     */
    public constructor(
        /**
         * Buffer of the database.
         */
        public readonly buffer: Buffer,
        private readonly options: Options = {}
    ) {
        assertPageType(this.buffer, PageType.DatabaseDefinitionPage);

        this.db = new Database(this.buffer, options.password);

        const mSysObjectsTable = new Table(MSYS_OBJECTS_TABLE, this.db, MSYS_OBJECTS_PAGE).getData<{
            Id: number;
            Name: string;
            Type: number;
            Flags: number;
        }>({
            columns: ["Id", "Name", "Type", "Flags"],
        });

        this.sysObjects = mSysObjectsTable.map((mSysObject: any) => {
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
     * @deprecated
     */
    public getFormat(): LegacyFormat {
        return this.db.format.legacyFormat;
    }

    /**
     * Returns an array of table names.
     *
     * @param normalTables Includes user tables. Default true.
     * @param systemTables Includes system tables. Default false.
     * @param linkedTables Includes linked tables. Default false.
     */
    public getTableNames(
        {
            normalTables,
            systemTables,
            linkedTables,
        }: {
            normalTables: boolean;
            systemTables: boolean;
            linkedTables: boolean;
        } = { normalTables: true, systemTables: false, linkedTables: false }
    ): string[] {
        const filteredSysObjects: SysObject[] = [];
        for (const sysObject of this.sysObjects) {
            if (sysObject.objectType === SysObjectType.Table) {
                if (!isSystemObject(sysObject)) {
                    if (normalTables) {
                        filteredSysObjects.push(sysObject);
                    }
                } else if (systemTables) {
                    filteredSysObjects.push(sysObject);
                }
            } else if (sysObject.objectType === SysObjectType.LinkedTable && linkedTables) {
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
    public getTable(name: string): Table {
        const sysObject = this.sysObjects
            .filter((o) => o.objectType === SysObjectType.Table)
            .find((o) => o.objectName === name);

        if (!sysObject) {
            throw new Error(`Could not find table with name ${name}`);
        }

        return new Table(name, this.db, sysObject.tablePage);
    }
}
