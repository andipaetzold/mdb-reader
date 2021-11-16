import { Column, ColumnType } from "..";
import { ColumnDefinition } from "../column";
import Database from "../Database";
import { readBigInt } from "./bigint";
import { readBinary } from "./binary";
import { readByte } from "./byte";
import { readComplexOrLong } from "./complexOrLong";
import { readCurrency } from "./currency";
import { readDateTime } from "./datetime";
import { readDouble } from "./double";
import { readFloat } from "./float";
import { readInteger } from "./integer";
import { readMemo } from "./memo";
import { readNumeric } from "./numeric";
import { readOLE } from "./ole";
import { readRepID } from "./repid";
import { readText } from "./text";

export type Value = number | BigInt | string | Buffer | Date | boolean | null;

const readFnByColType: {
    [type in Exclude<ColumnType, "boolean">]:
        | ((buffer: Buffer, column: Column, database: Database) => Exclude<Value, boolean | null>)
        | undefined;
} = {
    bigint: readBigInt,
    binary: readBinary,
    byte: readByte,
    complex: readComplexOrLong,
    currency: readCurrency,
    datetime: readDateTime,
    double: readDouble,
    float: readFloat,
    integer: readInteger,
    long: readComplexOrLong,
    text: readText,
    memo: readMemo,
    numeric: readNumeric,
    ole: readOLE,
    repid: readRepID,

    // not supported
    datetimextended: undefined,
};

export function readFieldValue(buffer: Buffer, column: ColumnDefinition, db: Database): Exclude<Value, boolean | null> {
    if (column.type === "boolean") {
        throw new Error("readFieldValue does not handle type boolean");
    }

    const read = readFnByColType[column.type];
    if (!read) {
        return `Column type ${column.type} is currently not supported`;
    }

    return read(buffer, column, db);
}
