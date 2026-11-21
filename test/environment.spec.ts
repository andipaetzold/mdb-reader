import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import type { Table } from "../src/index.js";
import type { Attachment } from "../src/types.js";
import BaseMDBReader from "../src/MDBReader.js";
import BrowserMDBReader from "../src/browser.js";
import NodeMDBReader from "../src/node.js";
import { environment as browserEnvironment } from "../src/environment/browser.js";
import { environment as nodeEnvironment } from "../src/environment/node.js";
import type { Environment } from "../src/environment/types.js";

const encryptedFixture = "test/encryption/data/office-agile-4.4.accdb";
const attachmentFixture = "test/data/V2016/attachments.accdb";
const encryptedOptions = { password: "password" };
const decryptedRows = [
    { ID: 1, Data: "One" },
    { ID: 2, Data: "Two" },
    { ID: 3, Data: "Three" },
];
const attachmentContents = [[], ["Attachment 1"], ["Attachment 1", "Attachment 2", "Attachment 3"]];

function readAttachmentContents(table: Table): string[][] {
    return table.getData<{ Attachments: Attachment[] }>({ columns: ["Attachments"] })
        .map(({ Attachments }) => Attachments.map(({ data }) => data.toString()));
}

function trackCrypto(delegate: Environment) {
    // A count avoids retaining every hash object created during key derivation.
    let hashes = 0;
    const decipher = vi.fn(delegate.createDecipheriv);
    const environment: Environment = {
        ...delegate,
        createHash(algorithm) {
            hashes++;
            return delegate.createHash(algorithm);
        },
        createDecipheriv: decipher,
    };

    return {
        environment,
        get hashes() {
            return hashes;
        },
        decipher,
    };
}

describe("reader environments", () => {
    it("reads encrypted rows and compressed attachments from interleaved public readers", () => {
        const nodeEncrypted = new NodeMDBReader(readFileSync(encryptedFixture), encryptedOptions).getTable("Table1");
        const browserAttachments = new BrowserMDBReader(readFileSync(attachmentFixture)).getTable("Table1");
        const browserEncrypted = new BrowserMDBReader(readFileSync(encryptedFixture), encryptedOptions).getTable("Table1");
        const nodeAttachments = new NodeMDBReader(readFileSync(attachmentFixture)).getTable("Table1");

        expect(readAttachmentContents(browserAttachments)).toEqual(attachmentContents);
        expect(nodeEncrypted.getData()).toEqual(decryptedRows);
        expect(browserEncrypted.getData()).toEqual(decryptedRows);
        expect(readAttachmentContents(nodeAttachments)).toEqual(attachmentContents);
    });

    it("uses only the owning adapter to decrypt pages after reader construction", () => {
        const node = trackCrypto(nodeEnvironment);
        const browser = trackCrypto(browserEnvironment);
        const nodeReader = new BaseMDBReader(readFileSync(encryptedFixture), node.environment, encryptedOptions);
        const nodeInitHashes = node.hashes;
        const nodeInitDeciphers = node.decipher.mock.calls.length;

        expect(nodeInitHashes).toBeGreaterThan(0);
        expect(nodeInitDeciphers).toBeGreaterThan(0);
        expect(browser.hashes).toBe(0);
        expect(browser.decipher).not.toHaveBeenCalled();

        const browserReader = new BaseMDBReader(readFileSync(encryptedFixture), browser.environment, encryptedOptions);
        const browserInitHashes = browser.hashes;
        const browserInitDeciphers = browser.decipher.mock.calls.length;

        expect(browserInitHashes).toBeGreaterThan(0);
        expect(browserInitDeciphers).toBeGreaterThan(0);
        expect(node.hashes).toBe(nodeInitHashes);
        expect(node.decipher).toHaveBeenCalledTimes(nodeInitDeciphers);

        expect(nodeReader.getTable("Table1").getData()).toEqual(decryptedRows);
        const nodeReadHashes = node.hashes;
        const nodeReadDeciphers = node.decipher.mock.calls.length;
        expect(nodeReadHashes).toBeGreaterThan(nodeInitHashes);
        expect(nodeReadDeciphers).toBeGreaterThan(nodeInitDeciphers);
        expect(browser.hashes).toBe(browserInitHashes);
        expect(browser.decipher).toHaveBeenCalledTimes(browserInitDeciphers);

        expect(browserReader.getTable("Table1").getData()).toEqual(decryptedRows);
        expect(browser.hashes).toBeGreaterThan(browserInitHashes);
        expect(browser.decipher.mock.calls.length).toBeGreaterThan(browserInitDeciphers);
        expect(node.hashes).toBe(nodeReadHashes);
        expect(node.decipher).toHaveBeenCalledTimes(nodeReadDeciphers);
    });

    it("uses only the owning adapter to inflate attachments when rows are read", () => {
        const nodeInflate = vi.fn(nodeEnvironment.inflate);
        const browserInflate = vi.fn(browserEnvironment.inflate);
        const nodeTable = new BaseMDBReader(readFileSync(attachmentFixture), {
            ...nodeEnvironment,
            inflate: nodeInflate,
        }).getTable("Table1");
        const browserTable = new BaseMDBReader(readFileSync(attachmentFixture), {
            ...browserEnvironment,
            inflate: browserInflate,
        }).getTable("Table1");

        expect(nodeInflate).not.toHaveBeenCalled();
        expect(browserInflate).not.toHaveBeenCalled();

        expect(readAttachmentContents(nodeTable)).toEqual(attachmentContents);
        expect(nodeInflate).toHaveBeenCalledTimes(4);
        expect(browserInflate).not.toHaveBeenCalled();

        expect(readAttachmentContents(browserTable)).toEqual(attachmentContents);
        expect(browserInflate).toHaveBeenCalledTimes(4);
        expect(nodeInflate).toHaveBeenCalledTimes(4);
    });
});
