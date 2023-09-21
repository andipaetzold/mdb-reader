import { Database } from "./Database.js";
import { PageType, assertPageType } from "./PageType.js";
import { Column } from "./column.js";
import { getColumnDefinitions } from "./table/getColumnDefinitions.js";
import { getDataFromPage } from "./table/getDataFromPage.js";
import { getDataPage } from "./table/getDataPage.js";
import { getRecordOffsets } from "./table/getRecordOffsets.js";
import { Table, Value } from "./types.js";
import { findMapPages } from "./usage-map.js";

export async function createTable(name: string, database: Database, firstDefinitionPage: number): Promise<Table> {
    // Concat all table definition pages
    let nextDefinitionPage = firstDefinitionPage;
    let buffer: Buffer | undefined;
    while (nextDefinitionPage > 0) {
        const curBuffer = await database.getPage(nextDefinitionPage);
        assertPageType(curBuffer, PageType.TableDefinition);

        if (!buffer) {
            buffer = curBuffer;
        } else {
            buffer = Buffer.concat([buffer, curBuffer.slice(8)]);
        }

        nextDefinitionPage = curBuffer.readUInt32LE(4);
    }
    if (!buffer) {
        throw new Error("Could not find table definition page");
    }
    const definitionBuffer = buffer;

    // Read row, column, and index counts
    const rowCount = definitionBuffer.readUInt32LE(database.format.tableDefinitionPage.rowCountOffset);

    const columnCount = definitionBuffer.readUInt16LE(database.format.tableDefinitionPage.columnCountOffset);
    const variableColumnCount = definitionBuffer.readUInt16LE(database.format.tableDefinitionPage.variableColumnCountOffset);
    // const fixedColumnCount = columnCount - variableColumnCount;

    // const logicalIndexCount = definitionBuffer.readInt32LE(database.format.tableDefinitionPage.logicalIndexCountOffset);
    const realIndexCount = definitionBuffer.readInt32LE(database.format.tableDefinitionPage.realIndexCountOffset);

    // Usage Map
    const usageMapBuffer = await database.findPageRow(
        definitionBuffer.readUInt32LE(database.format.tableDefinitionPage.usageMapOffset)
    );
    const dataPages = await findMapPages(usageMapBuffer, database);

    function getColumn(name: string): Column {
        const column = getColumns().find((c) => c.name === name);

        if (column === undefined) {
            throw new Error(`Could not find column with name ${name}`);
        }

        return column;
    }

    /**
     * Returns an ordered array of all column definitions.
     */
    function getColumns(): Column[] {
        const columnDefinitions = getColumnDefinitions({
            database,
            realIndexCount,
            columnCount,
            definitionBuffer,
        });

        columnDefinitions.sort((a, b) => a.index - b.index);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return columnDefinitions.map(({ index, variableIndex, fixedIndex, ...rest }) => rest);
    }

    function getColumnNames(): string[] {
        return getColumns().map((column) => column.name);
    }

    /**
     * Returns data from the table.
     *
     * @param columns Columns to be returned. Defaults to all columns.
     * @param rowOffset Index of the first row to be returned. 0-based. Defaults to 0.
     * @param rowLimit Maximum number of rows to be returned. Defaults to Infinity.
     */
    async function getData<TRow extends { [column in TColumn]: Value }, TColumn extends string = string>(
        options: {
            columns?: ReadonlyArray<string>;
            rowOffset?: number;
            rowLimit?: number;
        } = {}
    ): Promise<TRow[]> {
        const columnDefinitions = getColumnDefinitions({
            database,
            realIndexCount,
            columnCount,
            definitionBuffer,
        });

        const data = [];

        const columns = columnDefinitions.filter((c) => options.columns === undefined || options.columns.includes(c.name));

        let rowsToSkip = options?.rowOffset ?? 0;
        let rowsToRead = options?.rowLimit ?? Infinity;

        for (const dataPage of dataPages) {
            if (rowsToRead <= 0) {
                // All required data was loaded
                break;
            }

            const pageBuffer = await getDataPage(name, database, firstDefinitionPage, dataPage);
            const recordOffsets = getRecordOffsets(database, pageBuffer);

            if (recordOffsets.length <= rowsToSkip) {
                // All records can be skipped
                rowsToSkip -= recordOffsets.length;
                continue;
            }

            const recordOffsetsToLoad = recordOffsets.slice(rowsToSkip, rowsToSkip + rowsToRead);
            const recordsOnPage = await getDataFromPage(
                database,
                variableColumnCount,
                pageBuffer,
                recordOffsetsToLoad,
                columns
            );

            data.push(...recordsOnPage);

            rowsToRead -= recordsOnPage.length;
            rowsToSkip = 0;
        }

        return data as TRow[];
    }

    return {
        get name(): string {
            return name;
        },
        get rowCount(): number {
            return rowCount;
        },
        get columnCount(): number {
            return columnCount;
        },
        getColumn,
        getColumns,
        getColumnNames,
        getData,
    };
}
