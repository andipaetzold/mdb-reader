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
 * @see https://github.com/ashtuchkin/iconv-lite/blob/928f7c68e1be51c1391c70dbee244fd32623f121/encodings/sbcs-codec.js#L58-L69
 */
export function decodeWindows1252(buffer: Buffer): string {
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
