import { Column, ColumnDefinition } from "../column.js";
import Database from "../Database.js";
import { ColumnType, Value, ValueMap } from "../types.js";
import { readBigInt } from "./bigint.js";
import { readBinary } from "./binary.js";
import { readByte } from "./byte.js";
import { readComplexOrLong } from "./complexOrLong.js";
import { readCurrency } from "./currency.js";
import { readDateTime } from "./datetime.js";
import { readDateTimeExtended } from "./datetimextended.js";
import { readDouble } from "./double.js";
import { readFloat } from "./float.js";
import { readInteger } from "./integer.js";
import { readMemo } from "./memo.js";
import { readNumeric } from "./numeric.js";
import { readOLE } from "./ole.js";
import { readRepID } from "./repid.js";
import { readText } from "./text.js";

const readFnByColType: {
    [type in Exclude<ColumnType, ColumnType.Boolean>]:
        | ((buffer: Buffer, column: Column, database: Database) => ValueMap[type])
        | undefined;
} = {
    [ColumnType.BigInt]: readBigInt,
    [ColumnType.Binary]: readBinary,
    [ColumnType.Byte]: readByte,
    [ColumnType.Complex]: readComplexOrLong,
    [ColumnType.Currency]: readCurrency,
    [ColumnType.DateTime]: readDateTime,
    [ColumnType.DateTimeExtended]: readDateTimeExtended,
    [ColumnType.Double]: readDouble,
    [ColumnType.Float]: readFloat,
    [ColumnType.Integer]: readInteger,
    [ColumnType.Long]: readComplexOrLong,
    [ColumnType.Text]: readText,
    [ColumnType.Memo]: readMemo,
    [ColumnType.Numeric]: readNumeric,
    [ColumnType.OLE]: readOLE,
    [ColumnType.RepID]: readRepID,
};

export function readFieldValue(buffer: Buffer, column: ColumnDefinition, db: Database): Value | undefined {
    if (column.type === ColumnType.Boolean) {
        throw new Error("readFieldValue does not handle type boolean");
    }

    const read = readFnByColType[column.type];
    if (!read) {
        return `Column type ${column.type} is currently not supported`;
    }

    return read(buffer, column, db);
}
