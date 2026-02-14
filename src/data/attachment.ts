import { inflateSync } from "node:zlib";

const WRAPPER_HEADER_SIZE = 8;
const DATA_TYPE_RAW = 0;
const DATA_TYPE_COMPRESSED = 1;

/**
 * Decodes attachment FileData as stored in Access (OLE wrapper with optional deflate).
 * See Jackcess AttachmentColumnInfoImpl.decodeData().
 *
 * Layout: 8-byte header (4-byte type flag: 0=raw, 1=compressed; 4-byte length), then
 * content. If compressed, content is deflate-compressed. Content then has a
 * length-prefixed header (4-byte header length, then headerLen-4 bytes to skip), then
 * the actual file bytes.
 */
export function decodeAttachmentFileData(buffer: Buffer): Buffer {
    if (buffer.length < WRAPPER_HEADER_SIZE) {
        throw new Error("Unknown encoded attachment data format");
    }
    const typeFlag = buffer.readInt32LE(0);
    const dataLen = buffer.readInt32LE(4);
    let content = buffer.subarray(WRAPPER_HEADER_SIZE);

    if (typeFlag === DATA_TYPE_COMPRESSED) {
        content = inflateSync(content);
    } else if (typeFlag !== DATA_TYPE_RAW) {
        throw new Error(`Unknown encoded attachment data type ${typeFlag}`);
    }

    if (content.length < 4) {
        throw new Error("Invalid attachment content header");
    }
    const headerLen = content.readInt32LE(0);
    if (headerLen < 4 || headerLen > content.length) {
        throw new Error("Invalid attachment header length");
    }
    const payloadEnd = Math.min(dataLen, content.length);
    if (headerLen >= payloadEnd) {
        throw new Error("Invalid attachment header length");
    }
    return content.subarray(headerLen, payloadEnd);
}
