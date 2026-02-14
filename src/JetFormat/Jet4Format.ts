import { GENERAL_LEGACY_SORT_ORDER } from "../SortOrder.js";
import { CodecType, type JetFormat } from "./types.js";

export const jet4Format: JetFormat = {
    codecType: CodecType.JET,

    pageSize: 4096,

    textEncoding: "ucs-2",

    defaultSortOrder: GENERAL_LEGACY_SORT_ORDER,

    databaseDefinitionPage: {
        encryptedSize: 128,
        passwordSize: 40,
        creationDateOffset: 0x72, // 114
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

            /** Jet 4 complex column type ID (4 bytes). See Jackcess OFFSET_COLUMN_COMPLEX_ID. */
            complexIdOffset: 9,
        },
        columnNames: {
            nameLengthSize: 2,
        },

        usageMapOffset: 55,
    },
};
