[![CircleCI](https://circleci.com/gh/andipaetzold/mdb-reader/tree/main.svg?style=svg)](https://circleci.com/gh/andipaetzold/mdb-reader/tree/main)
[![Downloads](https://img.shields.io/npm/dm/mdb-reader)](https://www.npmjs.com/package/mdb-reader)
[![Version](https://img.shields.io/npm/v/mdb-reader.svg)](https://www.npmjs.com/package/mdb-reader)

# MDB Reader

Node Library to read data from Access databases.

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

TBD

### Access Database versions

- Access 97 (Jet 3)
- Access 2000, XP and 2003 (Jet 4)
- Access 2010 (ACE14)
- Access 2013 (ACE15)
- Access 2016 (ACE16)

_Only Jet 4 was tested during development and issues might occur with other database versions_

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

TBD

## Resources

- [MDB Tool](https://github.com/brianb/mdbtools): Set of applications to read and write Access files, written in C. Main source of knowledge about the file structure and algorithms to extract data from it.
- [Jackcess](https://jackcess.sourceforge.io): Java library to read and write Access files. It inspired the interface of this library.

## License

[MIT](LICENSE)
