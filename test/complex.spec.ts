import { describe, it, expect, beforeEach } from "vitest";
import { resolve } from "path";
import { readFileSync } from "fs";
import MDBReader from "../src/node.js";
import type { Attachment } from "../src/types.js";

describe("Complex", () => {
    describe.each([["V2016/attachments.accdb"]])("%s", (filename) => {
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
                expect(row).toBeTruthy();
                expect(row!.Attachments).toHaveLength(0);
            }

            {
                const row = rows.find((r) => r.Comment === "1 Attachment");
                expect(row).toBeTruthy();
                expect(row!.Attachments).toHaveLength(1);
                expect(row!.Attachments[0]).toEqual({
                    name: "attachment1.txt",
                    type: "txt",
                    data: Buffer.from("Attachment 1"),
                });
            }

            {
                const row = rows.find((r) => r.Comment === "3 Attachments");
                expect(row).toBeTruthy();
                expect(row!.Attachments).toHaveLength(3);
                expect(row!.Attachments[0]).toEqual({
                    name: "attachment1.txt",
                    type: "txt",
                    data: Buffer.from("Attachment 1"),
                });
                expect(row!.Attachments[1]).toEqual({
                    name: "attachment2.txt",
                    type: "txt",
                    data: Buffer.from("Attachment 2"),
                });
                expect(row!.Attachments[2]).toEqual({
                    name: "attachment3.txt",
                    type: "txt",
                    data: Buffer.from("Attachment 3"),
                });
            }
        });
    });
});
