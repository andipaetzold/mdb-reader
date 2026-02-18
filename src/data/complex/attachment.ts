import { environment } from "../../environment/index.js";

const DATA_TYPES = {
    RAW: 0,
    COMPRESSED: 1,
} as const;

/**
 * Decodes attachment FileData as stored in Access (OLE wrapper with optional deflate).
 */
export function decodeAttachmentFileData(buffer: Buffer): Buffer {
    /**
     * 0-3: type flag; 0=raw, 1=compressed
     * 4-7: length
     * 8-end: content
     */
    if (buffer.length < 8) {
        throw new Error("Unknown encoded attachment data format");
    }
    const typeFlag = buffer.readInt32LE(0);
    const dataLen = buffer.readInt32LE(4);
    let content = buffer.subarray(8);

    switch (typeFlag) {
        case DATA_TYPES.COMPRESSED:
            content = environment.inflate(content);
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
    if (headerLen < 4 || headerLen > content.length) {
        throw new Error("Invalid attachment header length");
    }
    const payloadEnd = Math.min(dataLen, content.length);
    if (headerLen >= payloadEnd) {
        throw new Error("Invalid attachment header length");
    }
    return content.subarray(headerLen, payloadEnd);
}
