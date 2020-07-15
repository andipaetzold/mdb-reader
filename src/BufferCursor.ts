import { uncompressText } from "./unicodeCompression";
import { Constants } from "./constants";

/**
 * @see https://github.com/bmancini55/node-buffer-cursor/blob/master/src/buffer-cursor.js
 */
export default class BufferCursor {
    public constructor(
        public readonly buffer: Buffer,
        public pos = 0,
        private readonly constants: Pick<Constants, "format">
    ) {}

    public getBuffer() {
        return this.buffer;
    }

    public setPos(newPos: number): void {
        this.pos = newPos;
    }

    public readUIntLE(length: number): number {
        const result = this.buffer.readUIntLE(this.pos, length);
        this.pos += length;
        return result;
    }

    public readUInt8(): number {
        return this.readUIntLE(1);
    }

    public readUInt16LE(): number {
        return this.readUIntLE(2);
    }

    public readUInt32LE(): number {
        return this.readUIntLE(4);
    }

    public readInt16LE(): number {
        const result = this.buffer.readInt16LE(this.pos);
        this.pos += 2;
        return result;
    }

    public readString(length: number): string {
        const result = uncompressText(
            this.buffer.slice(this.pos, this.pos + length),
            this.constants.format
        );
        this.pos += length;
        return result;
    }

    public skip(n: number): void {
        this.pos += n;
    }
}
