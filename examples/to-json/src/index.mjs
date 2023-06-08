import { MDBReader } from "mdb-reader";
import fs from "fs";

const filename = process.argv[2];

if (!filename || !fs.existsSync(filename)) {
    console.error("Missing filename");
    process.exit(1);
}

const buffer = fs.readFileSync(filename);

const reader = new MDBReader(buffer);
const tableNames = reader.getTableNames();

const data = {};
for (const tableName of tableNames) {
    data[tableName] = reader.getTable(tableName).getData();
}
console.log(JSON.stringify(data));
