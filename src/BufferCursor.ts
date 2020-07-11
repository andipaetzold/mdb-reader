/**
 * @see https://github.com/bmancini55/node-buffer-cursor/blob/master/src/buffer-cursor.js
 */
export default class BufferCursor {
    public constructor(public readonly buffer: Buffer, private pos = 0) {}

    public getBuffer() {
        return this.buffer;
    }

    public setPos(newPos: number): void {
        this.pos = newPos;
    }

    public getPos(): number {
        return this.pos;
    }

    public readUInt8(): number {
        const result = this.buffer.readUInt8(this.pos);
        this.pos += 1;
        return result;
    }

    public readUInt16LE(): number {
        const result = this.buffer.readUInt16LE(this.pos);
        this.pos += 2;
        return result;
    }

    public readInt16LE(): number {
        const result = this.buffer.readInt16LE(this.pos);
        this.pos += 2;
        return result;
    }

    public readUInt32LE(): number {
        const result = this.buffer.readUInt32LE(this.pos);
        this.pos += 4;
        return result;
    }

    public readString(length: number): string {
        const result = this.buffer.toString(
            "ucs-2",
            this.pos,
            this.pos + length
        );
        this.pos += length;
        return result;
    }

    public skip(n: number): void {
        this.pos += n;
    }
}
