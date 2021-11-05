export function readDateTime(buffer: Buffer): Date {
    const td = buffer.readDoubleLE();
    const daysDiff = 25569; // days between 1899-12-30 and 01-01-19070
    return new Date(Math.round((td - daysDiff) * 86400 * 1000));
}
