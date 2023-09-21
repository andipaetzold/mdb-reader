import { Column } from "./column.js";

export const ColumnTypes = {
    Boolean: "boolean",
    Byte: "byte",
    Integer: "integer",
    Long: "long",
    Currency: "currency",
    Float: "float",
    Double: "double",
    DateTime: "datetime",
    Binary: "binary",
    Text: "text",
    OLE: "ole",
    Memo: "memo",
    RepID: "repid",
    Numeric: "numeric",
    Complex: "complex",
    BigInt: "bigint",
    DateTimeExtended: "datetimextended",
} as const;

export type ColumnType = (typeof ColumnTypes)[keyof typeof ColumnTypes];

export type ValueMap = {
    [ColumnTypes.Binary]: Buffer;
    [ColumnTypes.BigInt]: bigint;
    [ColumnTypes.Boolean]: boolean;
    [ColumnTypes.Byte]: number;
    [ColumnTypes.Complex]: number;
    [ColumnTypes.Currency]: string;
    [ColumnTypes.DateTime]: Date;
    [ColumnTypes.DateTimeExtended]: string;
    [ColumnTypes.Double]: number;
    [ColumnTypes.Float]: number;
    [ColumnTypes.Integer]: number;
    [ColumnTypes.Long]: number;
    [ColumnTypes.Memo]: string;
    [ColumnTypes.Numeric]: string;
    [ColumnTypes.OLE]: Buffer;
    [ColumnTypes.RepID]: string;
    [ColumnTypes.Text]: string;
};

export type Value = ValueMap[keyof ValueMap] | null;

export interface SortOrder {
    value: number;
    version: number;
}

export type Table = {
    get name(): string;
    get rowCount(): number;
    get columnCount(): number;

    getColumn(name: string): Column;
    getColumns(): Column[];
    getColumnNames(): string[];

    getData<
        TRow extends {
            [column in TColumn]: Value;
        },
        TColumn extends string = string
    >(options?: {
        columns?: ReadonlyArray<string>;
        rowOffset?: number;
        rowLimit?: number;
    }): Promise<TRow[]>;
};
