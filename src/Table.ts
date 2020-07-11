import BufferCursor from "./BufferCursor";
import {
    Column,
    ColumnDefinition,
    getColumnType,
    parseColumnFlags,
} from "./column";
import { readFieldValue } from "./data";
import Database from "./Database";
import PageType, { assertPageType } from "./PageType";
import { findMapPages } from "./usage-map";
import {
    getBitmapValue,
    readNextString,
    readNumber,
    roundToFullByte,
} from "./util";

export default class Table {
    private readonly definitionBuffer: Buffer;
    private readonly dataPages: number[];

    public readonly rowCount: number;
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
        this.definitionBuffer = buffer!;

        // Read row, column, and index counts
        this.rowCount = this.definitionBuffer.readUInt32LE(
            this.db.constants.tableDefinitionPage.rowCountOffset
        );

        this.columnCount = this.definitionBuffer.readUInt16LE(
            this.db.constants.tableDefinitionPage.columnCountOffset
        );
        this.variableColumnCount = this.definitionBuffer.readUInt16LE(
            this.db.constants.tableDefinitionPage.variableColumnCountOffset
        );
        this.fixedColumnCount = this.columnCount - this.variableColumnCount;

        this.logicalIndexCount = this.definitionBuffer.readInt32LE(
            this.db.constants.tableDefinitionPage.logicalIndexCountOffset
        );
        this.realIndexCount = this.definitionBuffer.readInt32LE(
            this.db.constants.tableDefinitionPage.realIndexCountOffset
        );

        // Usage Map
        const usageMapBuffer = this.db.findPageRow(
            this.definitionBuffer.readUInt32LE(
                this.db.constants.tableDefinitionPage.usageMapOffset
            )
        );
        this.dataPages = findMapPages(usageMapBuffer);
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

    public getColumns(): Column[] {
        const columnDefinitions = this.getColumnDefinitions();

        columnDefinitions.sort((a, b) => a.index - b.index);

        return columnDefinitions.map(
            ({ index, variableIndex, fixedIndex, ...rest }) => rest
        );
    }

    private getColumnDefinitions(): ColumnDefinition[] {
        const columns: ColumnDefinition[] = [];

        let curDefinitionPos =
            this.db.constants.tableDefinitionPage.realIndexStartOffset +
            this.realIndexCount *
                this.db.constants.tableDefinitionPage.realIndexEntrySize;

        const namesCursor = new BufferCursor(
            this.definitionBuffer,

            curDefinitionPos +
                this.columnCount *
                    this.db.constants.tableDefinitionPage.columnsDefinition
                        .entrySize
        );

        for (let i = 0; i < this.columnCount; ++i) {
            const columnBuffer = this.definitionBuffer.slice(
                curDefinitionPos,
                curDefinitionPos +
                    this.db.constants.tableDefinitionPage.columnsDefinition
                        .entrySize
            );

            const type = getColumnType(
                this.definitionBuffer.readUInt8(
                    curDefinitionPos +
                        this.db.constants.tableDefinitionPage.columnsDefinition
                            .typeOffset
                )
            );

            const column: ColumnDefinition = {
                name: readNextString(
                    namesCursor,
                    this.db.constants.tableDefinitionPage.columnNames
                        .nameLengthSize
                ),
                type,
                index: columnBuffer.readUInt8(
                    this.db.constants.tableDefinitionPage.columnsDefinition
                        .indexOffset
                ),
                variableIndex: columnBuffer.readUInt8(
                    this.db.constants.tableDefinitionPage.columnsDefinition
                        .variableIndexOffset
                ),
                size:
                    type === "boolean"
                        ? 0
                        : columnBuffer.readUInt16LE(
                              this.db.constants.tableDefinitionPage
                                  .columnsDefinition.sizeOffset
                          ),
                fixedIndex: columnBuffer.readUInt8(
                    this.db.constants.tableDefinitionPage.columnsDefinition
                        .fixedIndexOffset
                ),
                ...parseColumnFlags(
                    columnBuffer.readUInt8(
                        this.db.constants.tableDefinitionPage.columnsDefinition
                            .flagsOffset
                    )
                ),
            };

            if (type === "numeric") {
                column.precision = columnBuffer.readUInt8(11);
                column.scale = columnBuffer.readUInt8(12);
            }

            columns.push(column);

            curDefinitionPos += this.db.constants.tableDefinitionPage
                .columnsDefinition.entrySize;
        }

        return columns;
    }

    public getColumnNames(): string[] {
        return this.getColumns().map((column) => column.name);
    }

    public getData(): { [column: string]: any }[] {
        const columnDefinitions = this.getColumnDefinitions();

        const data = [];

        for (const dataPage of this.dataPages) {
            data.push(...this.getDataFromPage(dataPage, columnDefinitions));
        }

        return [];
    }

    private getDataFromPage(
        page: number,
        columns: ColumnDefinition[]
    ): { [column: string]: any }[] {
        const pageBuffer = this.db.getPage(page);
        assertPageType(pageBuffer, PageType.DataPage);

        if (pageBuffer.readUInt32LE(4) !== this.firstDefinitionPage) {
            throw new Error(
                `Data page ${page} does not belong to table ${this.name}`
            );
        }

        const recordCount = pageBuffer.readUInt16BE(
            this.db.constants.dataPage.recordCountOffset
        );
        const recordOffsets: { start: number; end: number }[] = [];
        const offsetMask = 0x1fff; // 13 bits: 1111111111111
        for (let record = 0; record < recordCount; ++record) {
            const start = pageBuffer.readUInt16LE(
                this.db.constants.dataPage.record.countOffset * 2 + record * 2
            );
            const nextStart =
                record === 0
                    ? this.db.constants.pageSize
                    : pageBuffer.readUInt16LE(
                          this.db.constants.dataPage.record.countOffset +
                              record * 2
                      ) & offsetMask;
            const length = nextStart - (start & offsetMask);
            recordOffsets.push({
                start,
                end: start + length - 1,
            });
        }

        const data: { [column: string]: any }[] = [];

        for (const recordOffset of recordOffsets) {
            let recordStart = recordOffset.start;
            if (recordStart & 0x4000) {
                // deleted record
                continue;
            }
            if (recordStart & 0x8000) {
                // lookup record
                continue;
            }
            recordStart &= offsetMask; // remove flags

            const recordEnd = recordOffset.end;

            const totalVariableCount = readNumber(
                new BufferCursor(pageBuffer, recordStart),
                this.db.constants.dataPage.record.columnCountSize
            );

            const bitmaskSize = roundToFullByte(totalVariableCount);

            let variableColumnCount = 0;
            const variableColumnOffsets: number[] = [];
            if (this.variableColumnCount > 0) {
                switch (this.db.constants.format) {
                    case "Jet3":
                        variableColumnCount = pageBuffer.readUInt8(
                            recordEnd - bitmaskSize
                        );

                        // TODO: https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/write.c#L125-L147
                        break;
                    case "Jet4":
                        variableColumnCount = pageBuffer.readUInt16LE(
                            recordEnd - bitmaskSize - 1
                        );

                        for (let i = 0; i < variableColumnCount + 1; ++i) {
                            variableColumnOffsets.push(
                                pageBuffer.readUInt16LE(
                                    recordEnd - bitmaskSize - 3 - i * 2
                                )
                            );
                        }
                        break;
                }
            }

            const fixedColumnCount = totalVariableCount - variableColumnCount;

            const nullMask = pageBuffer.slice(
                recordEnd - bitmaskSize + 1,
                recordEnd - bitmaskSize + 1 + roundToFullByte(this.columnCount)
            );
            let fixedColumnsFound = 0;

            const recordValues: { [column: string]: any } = {};
            for (const column of columns) {
                /**
                 * undefined = will be set later. Undefined will never be returned to the user.
                 * null = actually null
                 */
                let value: any = undefined;
                let start: number;
                let size: number;

                if (!getBitmapValue(nullMask, column.index)) {
                    value = null;
                }

                if (
                    column.fixedLength &&
                    fixedColumnsFound < fixedColumnCount
                ) {
                    const colStart =
                        column.fixedIndex +
                        this.db.constants.dataPage.record.columnCountSize;
                    start = recordStart + colStart;
                    size = column.size;
                    ++fixedColumnsFound;
                } else if (
                    !column.fixedLength &&
                    column.variableIndex < variableColumnCount
                ) {
                    const colStart =
                        variableColumnOffsets[column.variableIndex];
                    start = recordStart + colStart;
                    size =
                        variableColumnOffsets[column.variableIndex + 1] -
                        colStart;
                } else {
                    start = 0;
                    value = null;
                    size = 0;
                }

                if (column.type === "boolean") {
                    value = value === undefined;
                } else if (value !== null) {
                    value = readFieldValue(
                        pageBuffer.slice(start, start + size),
                        column
                    );
                }

                recordValues[column.name] = value;
            }

            data.push(recordValues);
        }

        return data;
    }
}
