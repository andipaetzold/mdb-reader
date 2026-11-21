import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import MDBReader, { ColumnTypes } from "mdb-reader";
import NodeMDBReader, { ColumnTypes as NodeColumnTypes } from "mdb-reader/node";
import BrowserMDBReader, { ColumnTypes as BrowserColumnTypes } from "mdb-reader/browser";

const nodeEntry = new URL("../lib/node.js", import.meta.url).href;
const browserEntry = new URL("../lib/browser.js", import.meta.url).href;
assert.equal(import.meta.resolve("mdb-reader"), nodeEntry);
assert.equal(import.meta.resolve("mdb-reader/node"), nodeEntry);
assert.equal(import.meta.resolve("mdb-reader/browser"), browserEntry);
assert.equal(MDBReader, NodeMDBReader);
assert.notEqual(MDBReader, BrowserMDBReader);
assert.equal(ColumnTypes.Complex, "complex");
assert.equal(NodeColumnTypes, ColumnTypes);
assert.equal(BrowserColumnTypes, ColumnTypes);

const fixture = new URL("./data/V2016/attachments.accdb", import.meta.url);
for (const Reader of [MDBReader, NodeMDBReader, BrowserMDBReader]) {
    const reader = new Reader(readFileSync(fixture));
    assert.deepEqual(reader.getTableNames(), ["Table1"]);
    const table = reader.getTable("Table1");
    assert.equal(table.getColumn("Attachments").type, ColumnTypes.Complex);
    const [row] = table.getData({ columns: ["Attachments"], rowOffset: 1, rowLimit: 1 });
    assert.deepEqual(row.Attachments, [{ name: "attachment1.txt", type: "txt", data: Buffer.from("Attachment 1") }]);
}
