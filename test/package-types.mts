import MDBReader, { ColumnTypes, type Attachment, type Column, type ColumnType, type Options, type Table } from "mdb-reader";
import NodeMDBReader, { type Options as NodeOptions, type Table as NodeTable } from "mdb-reader/node";
import BrowserMDBReader, { type Options as BrowserOptions, type Table as BrowserTable } from "mdb-reader/browser";

export function readAttachments(buffer: Buffer, options?: Options): Attachment[][] {
    const nodeOptions: NodeOptions | undefined = options;
    const browserOptions: BrowserOptions | undefined = options;
    const tables: [Table, NodeTable, BrowserTable] = [
        new MDBReader(buffer, options).getTable("Table1"),
        new NodeMDBReader(buffer, nodeOptions).getTable("Table1"),
        new BrowserMDBReader(buffer, browserOptions).getTable("Table1"),
    ];
    const attachmentType: ColumnType = ColumnTypes.Complex;

    return tables.map((table) => {
        const column: Column = table.getColumn("Attachments");
        return column.type === attachmentType
            ? table.getData<{ Attachments: Attachment[] }>().flatMap((row) => row.Attachments)
            : [];
    });
}
