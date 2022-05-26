import { ColumnType } from "./index.js";
import { Column, ColumnDefinition, getColumnType, parseColumnFlags } from "./column.js";
import { readFieldValue } from "./data/index.js";
import Database from "./Database.js";
import PageType, { assertPageType } from "./PageType.js";
import { Value } from "./types.js";
import { uncompressText } from "./unicodeCompression.js";
import { findMapPages } from "./usage-map.js";
import { getBitmapValue, roundToFullByte } from "./util.js";

export default class Table {
    private readonly definitionBuffer: Buffer;
    private readonly dataPages: number[];

    /**
     * Number of rows.
     */
    public readonly rowCount: number;

    /**
     * Number of columns.
     */
    public readonly columnCount: number;

    private readonly variableColumnCount: number;
    private readonly fixedColumnCount: number;

    private readonly logicalIndexCount: number;
    private readonly realIndexCount: number;

    /**
     * @param name Table name. As this is stored in a MSysObjects, it has to be passed in
     * @param db
     * @param firstDefinitionPage The first page of the table definition referenced in the corresponding MSysObject
     */
    public constructor(
        public readonly name: string,
        private readonly db: Database,
        private readonly firstDefinitionPage: number
    ) {
        // Concat all table definition pages
        let nextDefinitionPage = this.firstDefinitionPage;
        let buffer: Buffer | undefined;
        while (nextDefinitionPage > 0) {
            const curBuffer = this.db.getPage(nextDefinitionPage);
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
        this.definitionBuffer = buffer;

        // Read row, column, and index counts
        this.rowCount = this.definitionBuffer.readUInt32LE(this.db.format.tableDefinitionPage.rowCountOffset);

        this.columnCount = this.definitionBuffer.readUInt16LE(this.db.format.tableDefinitionPage.columnCountOffset);
        this.variableColumnCount = this.definitionBuffer.readUInt16LE(
            this.db.format.tableDefinitionPage.variableColumnCountOffset
        );
        this.fixedColumnCount = this.columnCount - this.variableColumnCount;

        this.logicalIndexCount = this.definitionBuffer.readInt32LE(
            this.db.format.tableDefinitionPage.logicalIndexCountOffset
        );
        this.realIndexCount = this.definitionBuffer.readInt32LE(this.db.format.tableDefinitionPage.realIndexCountOffset);

        // Usage Map
        const usageMapBuffer = this.db.findPageRow(
            this.definitionBuffer.readUInt32LE(this.db.format.tableDefinitionPage.usageMapOffset)
        );
        this.dataPages = findMapPages(usageMapBuffer, this.db);
    }

    /**
     * Returns a column definition by its name.
     *
     * @param name Name of the column. Case sensitive.
     */
    public getColumn(name: string): Column {
        const column = this.getColumns().find((c) => c.name === name);

        if (column === undefined) {
            throw new Error(`Could not find column with name ${name}`);
        }

        return column;
    }

    /**
     * Returns an ordered array of all column definitions.
     */
    public getColumns(): Column[] {
        const columnDefinitions = this.getColumnDefinitions();

        columnDefinitions.sort((a, b) => a.index - b.index);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return columnDefinitions.map(({ index, variableIndex, fixedIndex, ...rest }) => rest);
    }

    private getColumnDefinitions(): ColumnDefinition[] {
        const columns: ColumnDefinition[] = [];

        let curDefinitionPos =
            this.db.format.tableDefinitionPage.realIndexStartOffset +
            this.realIndexCount * this.db.format.tableDefinitionPage.realIndexEntrySize;

        let namesCursorPos =
            curDefinitionPos + this.columnCount * this.db.format.tableDefinitionPage.columnsDefinition.entrySize;

        for (let i = 0; i < this.columnCount; ++i) {
            const columnBuffer = this.definitionBuffer.slice(
                curDefinitionPos,
                curDefinitionPos + this.db.format.tableDefinitionPage.columnsDefinition.entrySize
            );

            const type = getColumnType(
                this.definitionBuffer.readUInt8(
                    curDefinitionPos + this.db.format.tableDefinitionPage.columnsDefinition.typeOffset
                )
            );

            const nameLength = this.definitionBuffer.readUIntLE(
                namesCursorPos,
                this.db.format.tableDefinitionPage.columnNames.nameLengthSize
            );
            namesCursorPos += this.db.format.tableDefinitionPage.columnNames.nameLengthSize;
            const name = uncompressText(
                this.definitionBuffer.slice(namesCursorPos, namesCursorPos + nameLength),
                this.db.format
            );
            namesCursorPos += nameLength;

            const column: ColumnDefinition = {
                name,
                type,
                index: columnBuffer.readUInt8(this.db.format.tableDefinitionPage.columnsDefinition.indexOffset),
                variableIndex: columnBuffer.readUInt8(
                    this.db.format.tableDefinitionPage.columnsDefinition.variableIndexOffset
                ),
                size:
                    type === ColumnType.Boolean
                        ? 0
                        : columnBuffer.readUInt16LE(this.db.format.tableDefinitionPage.columnsDefinition.sizeOffset),
                fixedIndex: columnBuffer.readUInt16LE(this.db.format.tableDefinitionPage.columnsDefinition.fixedIndexOffset),
                ...parseColumnFlags(
                    columnBuffer.readUInt8(this.db.format.tableDefinitionPage.columnsDefinition.flagsOffset)
                ),
            };

            if (type === ColumnType.Numeric) {
                column.precision = columnBuffer.readUInt8(11);
                column.scale = columnBuffer.readUInt8(12);
            }

            columns.push(column);

            curDefinitionPos += this.db.format.tableDefinitionPage.columnsDefinition.entrySize;
        }

        return columns;
    }

    /**
     * Returns an ordered array of all column names.
     */
    public getColumnNames(): string[] {
        return this.getColumns().map((column) => column.name);
    }

    /**
     * Returns data from the table.
     *
     * @param columns Columns to be returned. Defaults to all columns.
     * @param rowOffset Index of the first row to be returned. 0-based. Defaults to 0.
     * @param rowLimit Maximum number of rows to be returned. Defaults to Infinity.
     */
    public getData<TRow extends { [column in TColumn]: Value }, TColumn extends string = string>(
        options: {
            columns?: ReadonlyArray<string>;
            rowOffset?: number;
            rowLimit?: number;
        } = {}
    ): TRow[] {
        const columnDefinitions = this.getColumnDefinitions();

        const data = [];

        const columns = columnDefinitions.filter((c) => options.columns === undefined || options.columns.includes(c.name));

        let rowsToSkip = options?.rowOffset ?? 0;
        let rowsToRead = options?.rowLimit ?? Infinity;

        for (const dataPage of this.dataPages) {
            if (rowsToRead <= 0) {
                // All required data was loaded
                break;
            }

            const pageBuffer = this.getDataPage(dataPage);
            const recordOffsets = this.getRecordOffsets(pageBuffer);

            if (recordOffsets.length <= rowsToSkip) {
                // All records can be skipped
                rowsToSkip -= recordOffsets.length;
                continue;
            }

            const recordOffsetsToLoad = recordOffsets.slice(rowsToSkip, rowsToSkip + rowsToRead);
            const recordsOnPage = this.getDataFromPage(pageBuffer, recordOffsetsToLoad, columns);

            data.push(...recordsOnPage);

            rowsToRead -= recordsOnPage.length;
            rowsToSkip = 0;
        }

        return data as TRow[];
    }

    private getDataPage(page: number) {
        const pageBuffer = this.db.getPage(page);
        assertPageType(pageBuffer, PageType.DataPage);

        if (pageBuffer.readUInt32LE(4) !== this.firstDefinitionPage) {
            throw new Error(`Data page ${page} does not belong to table ${this.name}`);
        }

        return pageBuffer;
    }

    private getRecordOffsets(pageBuffer: Buffer): RecordOffset[] {
        const recordCount = pageBuffer.readUInt16LE(this.db.format.dataPage.recordCountOffset);
        const recordOffsets: RecordOffset[] = [];
        for (let record = 0; record < recordCount; ++record) {
            const offsetMask = 0x1fff;

            let recordStart = pageBuffer.readUInt16LE(this.db.format.dataPage.record.countOffset + 2 + record * 2);
            if (recordStart & 0x4000) {
                // deleted record
                continue;
            }
            recordStart &= offsetMask; // remove flags

            const nextStart =
                record === 0
                    ? this.db.format.pageSize
                    : pageBuffer.readUInt16LE(this.db.format.dataPage.record.countOffset + record * 2) & offsetMask;
            const recordLength = nextStart - recordStart;
            const recordEnd = recordStart + recordLength - 1;

            recordOffsets.push([recordStart, recordEnd]);
        }
        return recordOffsets;
    }

    private getDataFromPage(
        pageBuffer: Buffer,
        recordOffsets: RecordOffset[],
        columns: ReadonlyArray<ColumnDefinition>
    ): { [column: string]: Value }[] {
        const lastColumnIndex = Math.max(...columns.map((c) => c.index), 0);
        const data: { [column: string]: Value }[] = [];
        for (const [recordStart, recordEnd] of recordOffsets) {
            const rowColumnCount = pageBuffer.readUIntLE(recordStart, this.db.format.dataPage.record.columnCountSize);

            const bitmaskSize = roundToFullByte(rowColumnCount);

            let rowVariableColumnCount = 0;
            const variableColumnOffsets: number[] = [];
            if (this.variableColumnCount > 0) {
                switch (this.db.format.dataPage.record.variableColumnCountSize) {
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
                    const colStart = column.fixedIndex + this.db.format.dataPage.record.columnCountSize;
                    start = recordStart + colStart;
                    size = column.size;
                    ++fixedColumnsFound;
                } else if (!column.fixedLength && column.variableIndex < rowVariableColumnCount) {
                    const colStart = variableColumnOffsets[column.variableIndex];
                    start = recordStart + colStart;
                    size = variableColumnOffsets[column.variableIndex + 1] - colStart;
                } else {
                    start = 0;
                    value = null;
                    size = 0;
                }

                if (column.type === ColumnType.Boolean) {
                    value = value === undefined;
                } else if (value !== null) {
                    value = readFieldValue(pageBuffer.slice(start, start + size), column, this.db);
                }

                recordValues[column.name] = value as Value;
            }

            data.push(recordValues);
        }

        return data;
    }
}

type RecordOffset = [start: number, end: number];
