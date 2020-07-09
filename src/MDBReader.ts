import { Format, getFormat } from "./format";
import PageType, { assertPageType } from "./PageType";
import Table from "./Table";

export default class MDBReader {
    public constructor(public readonly buffer: Buffer) {
        assertPageType(this.buffer, PageType.DatabaseDefinitionPage);
    }

    public getFormat(): Format {
        return getFormat(this.buffer);
    }

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
        throw new Error("Method not implemented.");
    }

    public getTable(name: string): Table {
        throw new Error("Method not implemented.");
    }
}
