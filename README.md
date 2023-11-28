[![npm](https://img.shields.io/npm/v/mdb-reader)](https://www.npmjs.com/package/mdb-reader)
[![tests](https://github.com/andipaetzold/mdb-reader/actions/workflows/push.yml/badge.svg?branch=main)](https://github.com/andipaetzold/mdb-reader/actions/workflows/push.yml?query=branch%3Amain)
[![downloads](https://img.shields.io/npm/dm/mdb-reader)](https://www.npmjs.com/package/mdb-reader)
[![license](https://img.shields.io/github/license/andipaetzold/mdb-reader)](https://github.com/andipaetzold/mdb-reader/blob/main/LICENSE)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# MDB Reader

JavaScript library to read data from Access databases.

## Installation

```sh
npm install mdb-reader
```

or

```sh
yarn add mdb-reader
```

## Compatibility

### Node / JavaScript

-   Node 18 and 20
-   Works in the browser with [buffer](https://www.npmjs.com/package/buffer) ([Example](https://github.com/andipaetzold/mdb-reader/tree/main/examples/browser))

### Access Database versions

-   Access 97 (Jet 3)
-   Access 2000, XP and 2003 (Jet 4)
-   Access 2010 (ACE14)
-   Access 2013 (ACE15)
-   Access 2016 (ACE16)
-   Access 2019 (ACE17)

### Encryption

-   Jet
-   Office Agile
-   Office RC4 Crypto API

## Dependencies

To decrypt databases, this library requires a few dependencies:

-   [`browserify-aes`](https://www.npmjs.com/browserify-aes): Only imported when running in browser
-   [`create-hash`](https://www.npmjs.com/create-hash): Only imported when running in browser
-   [`fast-xml-parser`](https://www.npmjs.com/fast-xml-parser)

## Usage

```javascript
import { readFileSync } from "fs";
import MDBReader from "mdb-reader";

const buffer = readFileSync("database.mdb");
const reader = new MDBReader(buffer);

reader.getTableNames(); // ['Cats', 'Dogs', 'Cars']

const table = reader.getTable("Cats");
table.getColumnNames(); // ['id', 'name', 'color']
table.getData(); // [{id: 5, name: 'Ashley', color: 'black'}, ...]
```

## API

### MDBReader

```typescript
class MDBReader {
    /**
     * @param buffer Buffer of the database.
     */
    constructor(
        buffer: Buffer,
        options?: {
            password?: string;
        }
    );

    /**
     * Date when the database was created
     */
    getCreationDate(): Date | null;

    /**
     * Database password
     */
    getPassword(): string | null;

    /**
     * Default sort order
     */
    getDefaultSortOrder(): Readonly<SortOrder>;

    /**
     * Returns an array of table names.
     *
     * @param normalTables Includes user tables.
     * @param systemTables Includes system tables.
     * @param linkedTables Includes linked tables.
     */
    getTableNames({
        normalTables,
        systemTables,
        linkedTables,
    }?: {
        normalTables: boolean;
        systemTables: boolean;
        linkedTables: boolean;
    }): string[];

    /**
     * Returns a table by its name.
     *
     * @param name Name of the table. Case sensitive.
     */
    getTable(name: string): Table;
}
```

### Table

```typescript
class Table {

    /**
     * Name of the table
     */
    readonly name: string,

    /**
     * Number of rows.
     */
    readonly rowCount: number;

    /**
     * Number of columns.
     */
    readonly columnCount: number;

    /**
     * Returns an ordered array of all column definitions.
     */
    getColumns(): Column[];

    /**
     * Returns a column definition by its name.
     *
     * @param name Name of the column. Case sensitive.
     */
    getColumn(name: string): Column;

    /**
     * Returns an ordered array of all column names.
     */
    getColumnNames(): string[];

    /**
     * Returns data from the table.
     *
     * @param columns Columns to be returned. Defaults to all columns.
     * @param rowOffset Index of the first row to be returned. 0-based. Defaults to 0.
     * @param rowLimit Maximum number of rows to be returned. Defaults to Infinity.
     */
    getData<TRow extends {
        [column in TColumn]: Value;
        TColumn extends string = string;
    }>(options?: {
        columns?: ReadonlyArray<TColumn>;
        rowOffset?: number;
        rowLimit?: number;
    }): TRow[];
}
```

### Column

```typescript
interface Column {
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
```

## Data Types

The data types returned by `Table.getData()` depends on the column type. Null values are always returned as `null`.

| Column Type      | JavaScript Type |
| ---------------- | --------------- |
| bigint           | `bigint`        |
| binary           | `Buffer`        |
| boolean          | `boolean`       |
| byte             | `number`        |
| complex          | `number`        |
| currency         | `string`        |
| datetime         | `Date`          |
| datetimeextended | `string`        |
| double           | `number`        |
| float            | `number`        |
| integer          | `number`        |
| long             | `number`        |
| memo             | `string`        |
| numeric          | `string`        |
| ole              | `Buffer`        |
| repid            | `string`        |
| text             | `string`        |

## Development

### Build

To build the library, first install the dependencies, then run `npm run build` for a single build or `npm run watch` for automatic rebuilds.

```sh
npm install
npm run build
```

### Tests

To run the tests, first install the dependencies, then run `npm test`. Watch mode can be started with `npm test -- --watch`.

```sh
npm install
npm test
```

## Resources

### MDB Tool

[GitHub](https://github.com/brianb/mdbtools)

Set of applications to read and write Access files, written in C. Main source of knowledge about the file structure and algorithms to extract data from it.

### Jackcess

[Jackcess](https://jackcess.sourceforge.io)

Java library to read and write Access files. It inspired the interface of this library. The databases used for testing are copied from the [repository](https://github.com/jahlborn/jackcess).

## The unofficial MDB Guide

[Tech Specs for the JET format used by Access 1997-2010](http://jabakobob.net/mdb/)

## License

[MIT](LICENSE)
