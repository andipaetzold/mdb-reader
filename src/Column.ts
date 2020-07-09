export default interface Column {
    name: string;
    type: ColumnType;
    size: number;

    fixedLength: number;
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
