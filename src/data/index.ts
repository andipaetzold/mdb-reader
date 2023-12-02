import type { Column, ColumnDefinition } from "../column.js";
import { Database } from "../Database.js";
import { type ColumnType, ColumnTypes, type Value, type ValueMap } from "../types.js";
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
    [type in Exclude<ColumnType, typeof ColumnTypes.Boolean>]:
        | ((buffer: Buffer, column: Column, database: Database) => ValueMap[type] | Promise<ValueMap[type]>)
        | undefined;
} = {
    [ColumnTypes.BigInt]: readBigInt,
    [ColumnTypes.Binary]: readBinary,
    [ColumnTypes.Byte]: readByte,
    [ColumnTypes.Complex]: readComplexOrLong,
    [ColumnTypes.Currency]: readCurrency,
    [ColumnTypes.DateTime]: readDateTime,
    [ColumnTypes.DateTimeExtended]: readDateTimeExtended,
    [ColumnTypes.Double]: readDouble,
    [ColumnTypes.Float]: readFloat,
    [ColumnTypes.Integer]: readInteger,
    [ColumnTypes.Long]: readComplexOrLong,
    [ColumnTypes.Text]: readText,
    [ColumnTypes.Memo]: readMemo,
    [ColumnTypes.Numeric]: readNumeric,
    [ColumnTypes.OLE]: readOLE,
    [ColumnTypes.RepID]: readRepID,
};

export async function readFieldValue(
    buffer: Buffer,
    column: ColumnDefinition,
    database: Database
): Promise<Value | undefined> {
    if (column.type === ColumnTypes.Boolean) {
        throw new Error("readFieldValue does not handle type boolean");
    }

    const read = readFnByColType[column.type];
    if (!read) {
        return `Column type ${column.type} is currently not supported`;
    }

    return await read(buffer, column, database);
}
