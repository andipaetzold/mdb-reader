import { JetFormat } from "./JetFormat";

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

/**
 * @see https://github.com/ashtuchkin/iconv-lite/blob/928f7c68e1be51c1391c70dbee244fd32623f121/encodings/sbcs-codec.js#L17-L19
 */
const ASCII_CHARS = Array.from(new Array(128).keys())
    .map((i) => String.fromCharCode(i))
    .join("");
/**
 * @see https://github.com/ashtuchkin/iconv-lite/blob/5d99a923f2bb9352abf80f8aeb850d924a8a1e38/encodings/sbcs-data-generated.js#L82
 */
const WINDOWS_1252_CHARS =
    "€�‚ƒ„…†‡ˆ‰Š‹Œ�Ž��‘’“”•–—˜™š›œ�žŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ";

/**
 * Decodes CP1252 / windows 1252
 *
 * Copied in to not add a dependency and keep the bundle (browser) small
 *
 * @see https://github.com/ashtuchkin/iconv-lite/blob/928f7c68e1be51c1391c70dbee244fd32623f121/encodings/sbcs-codec.js#L58-L69
 */
function decodeWindows1252(buffer: Buffer): string {
    const chars = `${ASCII_CHARS}${WINDOWS_1252_CHARS}`;
    const charsBuffer = Buffer.from(chars, "ucs2");

    const result = Buffer.alloc(buffer.length * 2);

    for (let i = 0; i < buffer.length; ++i) {
        const index = buffer[i] * 2;
        result[i * 2] = charsBuffer[index];
        result[i * 2 + 1] = charsBuffer[index + 1];
    }

    return result.toString("ucs2");
}
