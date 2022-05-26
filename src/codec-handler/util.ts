import { xor } from "../util.js";

export function getPageEncodingKey(encodingKey: Buffer, pageNumber: number): Buffer {
    const pageIndexBuffer = Buffer.alloc(4);
    pageIndexBuffer.writeUInt32LE(pageNumber);
    return xor(pageIndexBuffer, encodingKey);
}