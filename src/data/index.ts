import { Column, ColumnDefinition } from "../column";
import Database from "../Database";
import { ColumnType, Value, ValueMap } from "../types";
import { readBigInt } from "./bigint";
import { readBinary } from "./binary";
import { readByte } from "./byte";
import { readComplexOrLong } from "./complexOrLong";
import { readCurrency } from "./currency";
import { readDateTime } from "./datetime";
import { readDateTimeExtended } from "./datetimextended";
import { readDouble } from "./double";
import { readFloat } from "./float";
import { readInteger } from "./integer";
import { readMemo } from "./memo";
import { readNumeric } from "./numeric";
import { readOLE } from "./ole";
import { readRepID } from "./repid";
import { readText } from "./text";

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
