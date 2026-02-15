import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src/index.js";
import type { Attachment } from "../src/types.js";
import forEach from "mocha-each";
import { expect } from "chai";

describe.only("Complex", () => {
    forEach([["V2016/attachments.accdb"]]).describe("%s", (filename) => {
        const path = resolve("test/data", filename);

        let buffer: Buffer;
        beforeEach(() => {
            buffer = readFileSync(path);
        });

        it("should read the attachment column", () => {
            const reader = new MDBReader(buffer);
            const table = reader.getTable("Table1");

            const rows = table.getData<{ ID: number; Comment: string; Attachments: Attachment[] }>();

            {
                const row = rows.find((r) => r.Comment === "0 Attachments");
                expect(row).to.exist;
                expect(row!.Attachments).to.have.length(0);
            }

            {
                const row = rows.find((r) => r.Comment === "1 Attachment");
                expect(row).to.exist;
                expect(row!.Attachments).to.have.length(1);
                expect(row!.Attachments[0]).to.deep.equal({
                    name: "attachment1.txt",
                    type: "txt",
                    data: Buffer.from("Attachment 1"),
                });
            }

            {
                const row = rows.find((r) => r.Comment === "3 Attachments");
                expect(row).to.exist;
                expect(row!.Attachments).to.have.length(3);
                expect(row!.Attachments[0]).to.deep.equal({
                    name: "attachment1.txt",
                    type: "txt",
                    data: Buffer.from("Attachment 1"),
                });
                expect(row!.Attachments[1]).to.deep.equal({
                    name: "attachment2.txt",
                    type: "txt",
                    data: Buffer.from("Attachment 2"),
                });
                expect(row!.Attachments[2]).to.deep.equal({
                    name: "attachment3.txt",
                    type: "txt",
                    data: Buffer.from("Attachment 3"),
                });
            }
        });
    });
});
