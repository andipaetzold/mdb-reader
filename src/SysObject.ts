/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/include/mdbtools.h#L73-L87
 */
export const SysObjectTypes = {
    Form: 0x00,
    Table: 0x01,
    Macro: 0x02,
    SystemTable: 0x03,
    Report: 0x04,
    Query: 0x05,
    LinkedTable: 0x06,
    Module: 0x07,
    Relationship: 0x08,
    DatabaseProperty: 0x0b,
} satisfies Record<string, number>;

export type SysObjectType = typeof SysObjectTypes[keyof typeof SysObjectTypes];

export function isSysObjectType(typeValue: number): boolean {
    return Object.values(SysObjectTypes).includes(typeValue);
}

export interface SysObject {
    objectName: string;

    /**
     * null = unknown
     */
    objectType: SysObjectType | null;
    tablePage: number;
    flags: number;
}

const SYSTEM_OBJECT_FLAG = 0x80000000;
const ALT_SYSTEM_OBJECT_FLAG = 0x02;
const SYSTEM_OBJECT_FLAGS = SYSTEM_OBJECT_FLAG | ALT_SYSTEM_OBJECT_FLAG;

/**
 * @see https://github.com/jahlborn/jackcess/blob/3f75e95a21d9a9e3486519511cdd6178e3c2e3e4/src/main/java/com/healthmarketscience/jackcess/impl/DatabaseImpl.java#L194-L202
 */
export function isSystemObject(o: Pick<SysObject, "flags">): boolean {
    return (o.flags & SYSTEM_OBJECT_FLAGS) !== 0;
}
