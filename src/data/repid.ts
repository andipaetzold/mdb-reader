/** Read replication ID
 * 
 * @see https://github.com/mdbtools/mdbtools/blob/c3df30837ec2439d18c5515906072dc3306c0795/src/libmdb/data.c#L958-L972
 */ export function readRepID(buffer: Buffer): string {
    const str = buffer.toString("hex");
    const bytes = str.match(/.{1,2}/g);

    return (
        bytes[3] + // little-endian
        bytes[2] +
        bytes[1] +
        bytes[0] +
        "-" +
        bytes[5] + // little-endian
        bytes[4] +
        "-" +
        bytes[7] + // little-endian
        bytes[6] +
        "-" +
        bytes[8] + // big-endian
        bytes[9] +
        "-" +
        bytes[10] + // big-endian
        bytes[11] +
        bytes[12] +
        bytes[13] +
        bytes[14] +
        bytes[15]
    );
}
