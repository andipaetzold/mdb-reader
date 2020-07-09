export interface Column {
    name: string;
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
    scale: number;
}

export type ColumnType =
    | "boolean"
    | "byte"
    | "integer"
    | "long"
    | "money"
    | "float"
    | "double"
    | "datetime"
    | "binary"
    | "text"
    | "ole"
    | "memo"
    | "repid"
    | "numeric"
    | "complex";

const columnTypeMap: { [v: number]: ColumnType } = {
    0x01: "boolean",
    0x02: "byte",
    0x03: "integer",
    0x04: "long",
    0x05: "money",
    0x06: "float",
    0x07: "double",
    0x08: "datetime",
    0x09: "binary",
    0x0a: "text",
    0x0b: "ole",
    0x0c: "memo",
    0x0f: "repid",
    0x10: "numeric",
    0x12: "complex",
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
export function parseColumnFlags(
    flags: number
): Pick<Column, "fixedLength" | "nullable" | "autoLong" | "autoUUID"> {
    return {
        fixedLength: !!(flags & 0x01),
        nullable: !!(flags & 0x02),
        autoLong: !!(flags & 0x04),
        autoUUID: !!(flags & 0x40),
    };
}
