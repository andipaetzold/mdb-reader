import { inflateSync } from "node:zlib";

const WRAPPER_HEADER_SIZE = 8;

const DATA_TYPES = {
    RAW: 0,
    COMPRESSED: 1,
} as const;

/**
 * Decodes attachment FileData as stored in Access (OLE wrapper with optional deflate).
 *
 * Layout: 8-byte header (4-byte type flag: 0=raw, 1=compressed; 4-byte length), then
 * content. If compressed, content is deflate-compressed. Content then has a
 * length-prefixed header (4-byte header length, then headerLen-4 bytes to skip), then
 * the actual file bytes.
 */
export function decodeAttachmentFileData(buffer: Buffer): Buffer {
    console.group('decodeAttachmentFileData')
    if (buffer.length < WRAPPER_HEADER_SIZE) {
        throw new Error("Unknown encoded attachment data format");
    }
    const typeFlag = buffer.readInt32LE(0);
    const dataLen = buffer.readInt32LE(4);
    let content = buffer.subarray(WRAPPER_HEADER_SIZE);

    switch (typeFlag) {
        case DATA_TYPES.COMPRESSED:
            content = inflateSync(content);
            break;
        case DATA_TYPES.RAW:
            // do nothing
            break;
        default:
            throw new Error(`Unknown encoded attachment data type ${typeFlag}`);
    }

    if (content.length < 4) {
        throw new Error("Invalid attachment content header");
    }
    const headerLen = content.readInt32LE(0);
    console.log('headerLen', headerLen)
    if (headerLen < 4 || headerLen > content.length) {
        throw new Error("Invalid attachment header length");
    }
    const payloadEnd = Math.min(dataLen, content.length);
    if (headerLen >= payloadEnd) {
        throw new Error("Invalid attachment header length");
    }
    console.groupEnd()
    return content.subarray(headerLen, payloadEnd);
}
