import type { JetFormat } from "./JetFormat/index.js";
import { decodeWindows1252 } from "./dependencies/iconv-lite/index.js";

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L823-L831
 */
export function uncompressText(buffer: Buffer, format: Pick<JetFormat, "textEncoding">): string {
    if (format.textEncoding === "unknown") {
        // Assume charset is windows 1252 / CP1252 (windows default)
        // In some cases this might not work
        return decodeWindows1252(buffer);
    }

    if (buffer.length <= 2 || (buffer.readUInt8(0) & 0xff) !== 0xff || (buffer.readUInt8(1) & 0xff) !== 0xfe) {
        return buffer.toString("ucs-2");
    }

    let compressedMode = true;
    let curPos = 2;

    // maximum possible length
    const uncompressedBuffer = Buffer.alloc((buffer.length - curPos) * 2);
    let uncompressedBufferPos = 0;
    while (curPos < buffer.length) {
        const curByte = buffer.readUInt8(curPos++);
        if (curByte === 0) {
            compressedMode = !compressedMode;
        } else if (compressedMode) {
            uncompressedBuffer[uncompressedBufferPos++] = curByte;
            uncompressedBuffer[uncompressedBufferPos++] = 0;
        } else if (buffer.length - curPos >= 2) {
            uncompressedBuffer[uncompressedBufferPos++] = curByte;
            uncompressedBuffer[uncompressedBufferPos++] = buffer.readUInt8(curPos++);
        }
    }

    return uncompressedBuffer.slice(0, uncompressedBufferPos).toString("ucs-2");
}
