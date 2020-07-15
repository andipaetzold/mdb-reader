import { Constants } from "./constants";
import BufferCursor from "./BufferCursor";

/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L823-L831
 */
export function uncompressText(
    buffer: Buffer,
    constants: Pick<Constants, "format">
): string {
    if (constants.format === "Jet3") {
        return buffer.toString("utf8");
    }

    if (
        buffer.length > 2 &&
        (buffer.readUInt8(0) & 0xff) === 0xff &&
        (buffer.readUInt8(1) & 0xff) === 0xfe
    ) {
        let compressedMode = true;
        const cursor = new BufferCursor(buffer, 2, constants);

        // maximum possible length
        const uncompressedBuffer = Buffer.alloc(
            (cursor.buffer.length - cursor.pos) * 2
        );
        let uncompressedBufferPos = 0;
        while (cursor.pos < cursor.buffer.length) {
            const curByte = cursor.readUInt8();
            if (curByte === 0) {
                compressedMode = !compressedMode;
            } else if (compressedMode) {
                uncompressedBuffer[uncompressedBufferPos++] = curByte;
                uncompressedBuffer[uncompressedBufferPos++] = 0;
            } else if (cursor.buffer.length - cursor.pos >= 2) {
                uncompressedBuffer[uncompressedBufferPos++] = curByte;
                uncompressedBuffer[
                    uncompressedBufferPos++
                ] = cursor.readUInt8();
            }
        }

        return uncompressedBuffer
            .slice(0, uncompressedBufferPos)
            .toString("ucs-2");
    }

    return buffer.toString("ucs-2");
}
