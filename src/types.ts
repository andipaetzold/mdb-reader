export enum ColumnType {
    Boolean = "boolean",
    Byte = "byte",
    Integer = "integer",
    Long = "long",
    Currency = "currency",
    Float = "float",
    Double = "double",
    DateTime = "datetime",
    Binary = "binary",
    Text = "text",
    OLE = "ole",
    Memo = "memo",
    RepID = "repid",
    Numeric = "numeric",
    Complex = "complex",
    BigInt = "bigint",
    DateTimeExtended = "datetimextended",
}

export type ValueMap = {
    [ColumnType.Binary]: Buffer;
    [ColumnType.BigInt]: BigInt;
    [ColumnType.Boolean]: boolean;
    [ColumnType.Byte]: number;
    [ColumnType.Complex]: number;
    [ColumnType.Currency]: string;
    [ColumnType.DateTime]: Date;
    [ColumnType.DateTimeExtended]: string;
    [ColumnType.Double]: number;
    [ColumnType.Float]: number;
    [ColumnType.Integer]: number;
    [ColumnType.Long]: number;
    [ColumnType.Memo]: string;
    [ColumnType.Numeric]: string;
    [ColumnType.OLE]: Buffer;
    [ColumnType.RepID]: string;
    [ColumnType.Text]: string;
};

export type Value = ValueMap[ColumnType] | null;
