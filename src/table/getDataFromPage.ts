import type { Database } from "../Database.js";
import type { ColumnDefinition } from "../column.js";
import { readFieldValue } from "../data/index.js";
import { ColumnTypes, type Value } from "../types.js";
import { getBitmapValue, roundToFullByte } from "../util.js";

type RecordOffset = [start: number, end: number];
export async function getDataFromPage(
    database: Database,
    variableColumnCount: number,
    pageBuffer: Buffer,
    recordOffsets: RecordOffset[],
    columns: ReadonlyArray<ColumnDefinition>
): Promise<{ [column: string]: Value }[]> {
    const lastColumnIndex = Math.max(...columns.map((c) => c.index), 0);
    const data: { [column: string]: Value }[] = [];
    for (const [recordStart, recordEnd] of recordOffsets) {
        const rowColumnCount = pageBuffer.readUIntLE(recordStart, database.format.dataPage.record.columnCountSize);

        const bitmaskSize = roundToFullByte(rowColumnCount);

        let rowVariableColumnCount = 0;
        const variableColumnOffsets: number[] = [];
        if (variableColumnCount > 0) {
            switch (database.format.dataPage.record.variableColumnCountSize) {
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
                const colStart = column.fixedIndex + database.format.dataPage.record.columnCountSize;
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
                value = await readFieldValue(pageBuffer.slice(start, start + size), column, database);
            }

            recordValues[column.name] = value as Value;
        }

        data.push(recordValues);
    }

    return data;
}
