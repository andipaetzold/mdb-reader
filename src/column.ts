import { type ColumnType, ColumnTypes } from "./types.js";

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

    /**
     * Only set for type = 'complex'. Complex type ID from column definition; used to resolve
     * the flat table via MSysComplexColumns.
     */
    complexTypeId?: number;

    /**
     * Only set for type = 'complex'. First table definition page of the owning table;
     * used to match ConceptualTableID in MSysComplexColumns.
     */
    tableDefinitionPage?: number;
}

export type ComplexColumnDefinition = ColumnDefinition & {
    complexTypeId: number;
    tableDefinitionPage: number;
};

const columnTypeMap: Record<number, ColumnType> = {
    0x01: ColumnTypes.Boolean,
    0x02: ColumnTypes.Byte,
    0x03: ColumnTypes.Integer,
    0x04: ColumnTypes.Long,
    0x05: ColumnTypes.Currency,
    0x06: ColumnTypes.Float,
    0x07: ColumnTypes.Double,
    0x08: ColumnTypes.DateTime,
    0x09: ColumnTypes.Binary,
    0x0a: ColumnTypes.Text,
    0x0b: ColumnTypes.OLE,
    0x0c: ColumnTypes.Memo,
    0x0f: ColumnTypes.RepID,
    0x10: ColumnTypes.Numeric,
    0x12: ColumnTypes.Complex,
    0x13: ColumnTypes.BigInt,
    0x14: ColumnTypes.DateTimeExtended,
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
