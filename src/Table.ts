import { ColumnTypes } from "./index.js";
import { Column, ColumnDefinition, getColumnType, parseColumnFlags } from "./column.js";
import { readFieldValue } from "./data/index.js";
import { Database } from "./Database.js";
import { PageType, assertPageType } from "./PageType.js";
import { Value } from "./types.js";
import { uncompressText } from "./unicodeCompression.js";
import { findMapPages } from "./usage-map.js";
import { getBitmapValue, roundToFullByte } from "./util.js";

export class Table {
    #name: string;
    #database: Database;
    #firstDefinitionPage: number;

    #definitionBuffer: Buffer;
    #dataPages: number[];

    /**
     * Number of rows.
     */
    #rowCount: number;

    /**
     * Number of columns.
     */
    #columnCount: number;

    #variableColumnCount: number;
    // #fixedColumnCount: number;

    // #logicalIndexCount: number;
    #realIndexCount: number;

    /**
     * @param name Table name. As this is stored in a MSysObjects, it has to be passed in
     * @param database
     * @param firstDefinitionPage The first page of the table definition referenced in the corresponding MSysObject
     */
    constructor(name: string, database: Database, firstDefinitionPage: number) {
        this.#name = name;
        this.#database = database;
        this.#firstDefinitionPage = firstDefinitionPage;

        // Concat all table definition pages
        let nextDefinitionPage = this.#firstDefinitionPage;
        let buffer: Buffer | undefined;
        while (nextDefinitionPage > 0) {
            const curBuffer = this.#database.getPage(nextDefinitionPage);
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
        this.#definitionBuffer = buffer;

        // Read row, column, and index counts
        this.#rowCount = this.#definitionBuffer.readUInt32LE(this.#database.format.tableDefinitionPage.rowCountOffset);

        this.#columnCount = this.#definitionBuffer.readUInt16LE(this.#database.format.tableDefinitionPage.columnCountOffset);
        this.#variableColumnCount = this.#definitionBuffer.readUInt16LE(
            this.#database.format.tableDefinitionPage.variableColumnCountOffset
        );
        // this.#fixedColumnCount = this.#columnCount - this.#variableColumnCount;

        // this.#logicalIndexCount = this.#definitionBuffer.readInt32LE(
        //     this.#database.format.tableDefinitionPage.logicalIndexCountOffset
        // );
        this.#realIndexCount = this.#definitionBuffer.readInt32LE(
            this.#database.format.tableDefinitionPage.realIndexCountOffset
        );

        // Usage Map
        const usageMapBuffer = this.#database.findPageRow(
            this.#definitionBuffer.readUInt32LE(this.#database.format.tableDefinitionPage.usageMapOffset)
        );
        this.#dataPages = findMapPages(usageMapBuffer, this.#database);
    }

    get name(): string {
        return this.#name;
    }

    get rowCount(): number {
        return this.#rowCount;
    }

    get columnCount(): number {
        return this.#columnCount;
    }

    /**
     * Returns a column definition by its name.
     *
     * @param name Name of the column. Case sensitive.
     */
    getColumn(name: string): Column {
        const column = this.getColumns().find((c) => c.name === name);

        if (column === undefined) {
            throw new Error(`Could not find column with name ${name}`);
        }

        return column;
    }

    /**
     * Returns an ordered array of all column definitions.
     */
    getColumns(): Column[] {
        const columnDefinitions = this.#getColumnDefinitions();

        columnDefinitions.sort((a, b) => a.index - b.index);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return columnDefinitions.map(({ index, variableIndex, fixedIndex, ...rest }) => rest);
    }

    #getColumnDefinitions(): ColumnDefinition[] {
        const columns: ColumnDefinition[] = [];

        let curDefinitionPos =
            this.#database.format.tableDefinitionPage.realIndexStartOffset +
            this.#realIndexCount * this.#database.format.tableDefinitionPage.realIndexEntrySize;

        let namesCursorPos =
            curDefinitionPos + this.#columnCount * this.#database.format.tableDefinitionPage.columnsDefinition.entrySize;

        for (let i = 0; i < this.#columnCount; ++i) {
            const columnBuffer = this.#definitionBuffer.slice(
                curDefinitionPos,
                curDefinitionPos + this.#database.format.tableDefinitionPage.columnsDefinition.entrySize
            );

            const type = getColumnType(
                this.#definitionBuffer.readUInt8(
                    curDefinitionPos + this.#database.format.tableDefinitionPage.columnsDefinition.typeOffset
                )
            );

            const nameLength = this.#definitionBuffer.readUIntLE(
                namesCursorPos,
                this.#database.format.tableDefinitionPage.columnNames.nameLengthSize
            );
            namesCursorPos += this.#database.format.tableDefinitionPage.columnNames.nameLengthSize;
            const name = uncompressText(
                this.#definitionBuffer.slice(namesCursorPos, namesCursorPos + nameLength),
                this.#database.format
            );
            namesCursorPos += nameLength;

            const column: ColumnDefinition = {
                name,
                type,
                index: columnBuffer.readUInt8(this.#database.format.tableDefinitionPage.columnsDefinition.indexOffset),
                variableIndex: columnBuffer.readUInt8(
                    this.#database.format.tableDefinitionPage.columnsDefinition.variableIndexOffset
                ),
                size:
                    type === ColumnTypes.Boolean
                        ? 0
                        : columnBuffer.readUInt16LE(this.#database.format.tableDefinitionPage.columnsDefinition.sizeOffset),
                fixedIndex: columnBuffer.readUInt16LE(
                    this.#database.format.tableDefinitionPage.columnsDefinition.fixedIndexOffset
                ),
                ...parseColumnFlags(
                    columnBuffer.readUInt8(this.#database.format.tableDefinitionPage.columnsDefinition.flagsOffset)
                ),
            };

            if (type === ColumnTypes.Numeric) {
                column.precision = columnBuffer.readUInt8(11);
                column.scale = columnBuffer.readUInt8(12);
            }

            columns.push(column);

            curDefinitionPos += this.#database.format.tableDefinitionPage.columnsDefinition.entrySize;
        }

        return columns;
    }

    /**
     * Returns an ordered array of all column names.
     */
    getColumnNames(): string[] {
        return this.getColumns().map((column) => column.name);
    }

    /**
     * Returns data from the table.
     *
     * @param columns Columns to be returned. Defaults to all columns.
     * @param rowOffset Index of the first row to be returned. 0-based. Defaults to 0.
     * @param rowLimit Maximum number of rows to be returned. Defaults to Infinity.
     */
    getData<TRow extends { [column in TColumn]: Value }, TColumn extends string = string>(
        options:
            | {
                  columns?: ReadonlyArray<string> | undefined;
                  rowOffset?: number | undefined;
                  rowLimit?: number | undefined;
              }
            | undefined = {}
    ): TRow[] {
        const columnDefinitions = this.#getColumnDefinitions();

        const data = [];

        const columns = columnDefinitions.filter((c) => options.columns === undefined || options.columns.includes(c.name));

        let rowsToSkip = options?.rowOffset ?? 0;
        let rowsToRead = options?.rowLimit ?? Infinity;

        for (const dataPage of this.#dataPages) {
            if (rowsToRead <= 0) {
                // All required data was loaded
                break;
            }

            const pageBuffer = this.#getDataPage(dataPage);
            const recordOffsets = this.#getRecordOffsets(pageBuffer);

            if (recordOffsets.length <= rowsToSkip) {
                // All records can be skipped
                rowsToSkip -= recordOffsets.length;
                continue;
            }

            const recordOffsetsToLoad = recordOffsets.slice(rowsToSkip, rowsToSkip + rowsToRead);
            const recordsOnPage = this.#getDataFromPage(pageBuffer, recordOffsetsToLoad, columns);

            data.push(...recordsOnPage);

            rowsToRead -= recordsOnPage.length;
            rowsToSkip = 0;
        }

        return data as TRow[];
    }

    #getDataPage(page: number) {
        const pageBuffer = this.#database.getPage(page);
        assertPageType(pageBuffer, PageType.DataPage);

        if (pageBuffer.readUInt32LE(4) !== this.#firstDefinitionPage) {
            throw new Error(`Data page ${page} does not belong to table ${this.#name}`);
        }

        return pageBuffer;
    }

    #getRecordOffsets(pageBuffer: Buffer): RecordOffset[] {
        const recordCount = pageBuffer.readUInt16LE(this.#database.format.dataPage.recordCountOffset);
        const recordOffsets: RecordOffset[] = [];
        for (let record = 0; record < recordCount; ++record) {
            const offsetMask = 0x1fff;

            let recordStart = pageBuffer.readUInt16LE(this.#database.format.dataPage.record.countOffset + 2 + record * 2);
            if (recordStart & 0x4000) {
                // deleted record
                continue;
            }
            recordStart &= offsetMask; // remove flags

            const nextStart =
                record === 0
                    ? this.#database.format.pageSize
                    : pageBuffer.readUInt16LE(this.#database.format.dataPage.record.countOffset + record * 2) & offsetMask;
            const recordLength = nextStart - recordStart;
            const recordEnd = recordStart + recordLength - 1;

            recordOffsets.push([recordStart, recordEnd]);
        }
        return recordOffsets;
    }

    #getDataFromPage(
        pageBuffer: Buffer,
        recordOffsets: RecordOffset[],
        columns: ReadonlyArray<ColumnDefinition>
    ): { [column: string]: Value }[] {
        const lastColumnIndex = Math.max(...columns.map((c) => c.index), 0);
        const data: { [column: string]: Value }[] = [];
        for (const [recordStart, recordEnd] of recordOffsets) {
            const rowColumnCount = pageBuffer.readUIntLE(recordStart, this.#database.format.dataPage.record.columnCountSize);

            const bitmaskSize = roundToFullByte(rowColumnCount);

            let rowVariableColumnCount = 0;
            const variableColumnOffsets: number[] = [];
            if (this.#variableColumnCount > 0) {
                switch (this.#database.format.dataPage.record.variableColumnCountSize) {
                    case 1: {
                        rowVariableColumnCount = pageBuffer.readUInt8(recordEnd - bitmaskSize);

                        // https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/write.c#L125-L147
                        const recordLength = recordEnd - recordStart + 1;
                        let jumpCount = Math.floor((recordLength - 1) / 256);
                        const columnPointer = recordEnd - bitmaskSize - jumpCount - 1;

                        /* If last jump is a dummy value, ignore it */
                        if ((columnPointer - recordStart - rowVariableColumnCount) / 256 < jumpCount) {
                            --jumpCount;
                        }

                        let jumpsUsed = 0;
                        for (let i = 0; i < rowVariableColumnCount + 1; ++i) {
                            while (
                                jumpsUsed < jumpCount &&
                                i === pageBuffer.readUInt8(recordEnd - bitmaskSize - jumpsUsed - 1)
                            ) {
                                ++jumpsUsed;
                            }
                            variableColumnOffsets.push(pageBuffer.readUInt8(columnPointer - i) + jumpsUsed * 256);
                        }
                        break;
                    }
                    case 2: {
                        rowVariableColumnCount = pageBuffer.readUInt16LE(recordEnd - bitmaskSize - 1);

                        // https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/write.c#L115-L124
                        for (let i = 0; i < rowVariableColumnCount + 1; ++i) {
                            variableColumnOffsets.push(pageBuffer.readUInt16LE(recordEnd - bitmaskSize - 3 - i * 2));
                        }
                        break;
                    }
                }
            }

            const rowFixedColumnCount = rowColumnCount - rowVariableColumnCount;

            const nullMask = pageBuffer.slice(
                recordEnd - bitmaskSize + 1,
                recordEnd - bitmaskSize + 1 + roundToFullByte(lastColumnIndex + 1)
            );
            let fixedColumnsFound = 0;

            const recordValues: { [column: string]: Value } = {};
            for (const column of [...columns].sort((a, b) => a.index - b.index)) {
                /**
                 * undefined = will be set later. Undefined will never be returned to the user.
                 * null = actually null
                 */
                let value: Value | undefined = undefined;
                let start: number;
                let size: number;

                if (!getBitmapValue(nullMask, column.index)) {
                    value = null;
                }

                if (column.fixedLength && fixedColumnsFound < rowFixedColumnCount) {
                    const colStart = column.fixedIndex + this.#database.format.dataPage.record.columnCountSize;
                    start = recordStart + colStart;
                    size = column.size;
                    ++fixedColumnsFound;
                } else if (!column.fixedLength && column.variableIndex < rowVariableColumnCount) {
                    const colStart = variableColumnOffsets[column.variableIndex]!;
                    start = recordStart + colStart;
                    size = variableColumnOffsets[column.variableIndex + 1]! - colStart;
                } else {
                    start = 0;
                    value = null;
                    size = 0;
                }

                if (column.type === ColumnTypes.Boolean) {
                    value = value === undefined;
                } else if (value !== null) {
                    value = readFieldValue(pageBuffer.slice(start, start + size), column, this.#database);
                }

                recordValues[column.name] = value as Value;
            }

            data.push(recordValues);
        }

        return data;
    }
}

type RecordOffset = [start: number, end: number];
