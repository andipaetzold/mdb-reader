import { ColumnType } from "./types";

export interface Column {
    /**
     * Name of the table
     */
    name: string;

    /**
     * Type of the table
     */
    type: ColumnType;
    size: number;

    fixedLength: boolean;
    nullable: boolean;
    autoLong: boolean;
    autoUUID: boolean;

    /**
     * Only exists if type = 'numeric'
     */
    precision?: number;

    /**
     * Only exists if type = 'numeric'
     */
    scale?: number;
}

/**
 * Includes internal fields that are not relevant for the user of the library.
 */
export interface ColumnDefinition extends Column {
    index: number;
    variableIndex: number;
    fixedIndex: number;
}

const columnTypeMap: { [v: number]: ColumnType } = {
    0x01: ColumnType.Boolean,
    0x02: ColumnType.Byte,
    0x03: ColumnType.Integer,
    0x04: ColumnType.Long,
    0x05: ColumnType.Currency,
    0x06: ColumnType.Float,
    0x07: ColumnType.Double,
    0x08: ColumnType.DateTime,
    0x09: ColumnType.Binary,
    0x0a: ColumnType.Text,
    0x0b: ColumnType.Long,
    0x0c: ColumnType.Memo,
    0x0f: ColumnType.RepID,
    0x10: ColumnType.Numeric,
    0x12: ColumnType.Complex,
    0x13: ColumnType.BigInt,
    0x14: ColumnType.DateTimeExtended,
};

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/include/mdbtools.h#L88-L104
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L498-L515
 */
export function getColumnType(typeValue: number): ColumnType {
    const type = columnTypeMap[typeValue];

    if (type === undefined) {
        throw new Error("Unsupported column type");
    }

    return type;
}

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L481-L491
 */
export function parseColumnFlags(flags: number): Pick<Column, "fixedLength" | "nullable" | "autoLong" | "autoUUID"> {
    return {
        fixedLength: !!(flags & 0x01),
        nullable: !!(flags & 0x02),
        autoLong: !!(flags & 0x04),
        autoUUID: !!(flags & 0x40),
    };
}
