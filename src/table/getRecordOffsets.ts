import { Database } from "../Database.js";

export type RecordOffset = [start: number, end: number];
export function getRecordOffsets(database: Database, pageBuffer: Buffer): RecordOffset[] {
    const recordCount = pageBuffer.readUInt16LE(database.format.dataPage.recordCountOffset);
    const recordOffsets: RecordOffset[] = [];
    for (let record = 0; record < recordCount; ++record) {
        const offsetMask = 0x1fff;

        let recordStart = pageBuffer.readUInt16LE(database.format.dataPage.record.countOffset + 2 + record * 2);
        if (recordStart & 0x4000) {
            // deleted record
            continue;
        }
        recordStart &= offsetMask; // remove flags

        const nextStart =
            record === 0
                ? database.format.pageSize
                : pageBuffer.readUInt16LE(database.format.dataPage.record.countOffset + record * 2) & offsetMask;
        const recordLength = nextStart - recordStart;
        const recordEnd = recordStart + recordLength - 1;

        recordOffsets.push([recordStart, recordEnd]);
    }
    return recordOffsets;
}
