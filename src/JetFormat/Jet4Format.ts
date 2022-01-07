import { JetFormat } from "./types";

export const jet4Format: JetFormat = {
    pageSize: 4096,

    textEncoding: "ucs-2",

    databaseDefinitionPage: {
        encryptedSize: 128,
        passwordSize: 40,
        defaultSortOrder: {
            offset: 0x6e, // 110
            size: 4,
        },
    },

    dataPage: {
        recordCountOffset: 12,

        record: {
            countOffset: 12,

            columnCountSize: 2,
            variableColumnCountSize: 2,
        },
    },

    tableDefinitionPage: {
        rowCountOffset: 16,

        variableColumnCountOffset: 43,
        columnCountOffset: 45,

        logicalIndexCountOffset: 47,
        realIndexCountOffset: 51,

        realIndexStartOffset: 63,
        realIndexEntrySize: 12,

        columnsDefinition: {
            typeOffset: 0,
            indexOffset: 5,
            variableIndexOffset: 7,
            flagsOffset: 15,
            fixedIndexOffset: 21,
            sizeOffset: 23,

            entrySize: 25,
        },
        columnNames: {
            nameLengthSize: 2,
        },

        usageMapOffset: 55,
    },
};
