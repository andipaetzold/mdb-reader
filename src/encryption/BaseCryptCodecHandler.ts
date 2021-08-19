import { Hash } from "crypto";
import { xor } from "../util";
import { CodecHandler } from "./CodecHandler";

export abstract class BaseCryptCodecHandler extends CodecHandler {
    public static readonly CIPHER_DECRYPT_MODE = false;
    public static readonly CIPHER_ENCRYPT_MODE = true;

    public constructor(private encodingKey: Buffer) {
        super();
    }

    /**
     * Gets the encoding key combined with the given page number.
     */
    protected getEncodingKey(pageNumber: number): Buffer {
        return BaseCryptCodecHandler.applyPageNumber(this.encodingKey, pageNumber);
    }

    /**
     * Returns a copy of the given key with the bytes of the given pageNumber
     * applied at the given offset using XOR.
     */
    public static applyPageNumber(key: Buffer, pageNumber: number): Buffer {
        const pageNumberBuffer = Buffer.alloc(4);
        pageNumberBuffer.writeUInt32LE(pageNumber);
        return xor(pageNumberBuffer, key);
    }

    /**
     * Hashes the given bytes1 and bytes2 using the given digest and returns the
     * hash fixed to the given length.
     */
    public static hash(createDigest: () => Hash, buffers: Buffer[], maxLength?: number): Buffer {
        const digest = createDigest();

        buffers.forEach((buffer) => digest.update(buffer));

        const result = digest.digest();

        if (maxLength) {
            return this.fixToLength(result, maxLength);
        }

        return result;
    }

    /**
     * @return a Buffer of the given length, truncating or padding the given
     * Buffer as necessary using the given padByte.
     */
    public static fixToLength(buffer: Buffer, length: number, padByte: number = 0): Buffer {
        if (buffer.length > length) {
            return buffer.slice(0, length);
        }

        if (buffer.length < length) {
            return Buffer.from(buffer).fill(padByte, buffer.length, length);
        }

        // buffer already has correct length
        return buffer;
    }
}
