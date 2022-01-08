import { GENERAL_97_SORT_ORDER } from "../SortOrder";
import { JetFormat } from "./types";

export const jet3Format: JetFormat = {
    pageSize: 2048,

    textEncoding: "utf8",

    defaultSortOrder: GENERAL_97_SORT_ORDER,

    databaseDefinitionPage: {
        encryptedSize: 126,
        passwordSize: 20,
        creationDateOffset: null,
        defaultSortOrder: {
            offset: 0x3a, // 58
            size: 2,
        },
    },

    dataPage: {
        recordCountOffset: 8,

        record: {
            countOffset: 8,

            columnCountSize: 1,
            variableColumnCountSize: 1,
        },
    },

    tableDefinitionPage: {
        rowCountOffset: 12,

        columnCountOffset: 25,
        variableColumnCountOffset: 25,

        logicalIndexCountOffset: 27,
        realIndexCountOffset: 31,

        realIndexStartOffset: 43,
        realIndexEntrySize: 8,

        columnsDefinition: {
            typeOffset: 0,
            indexOffset: 1,
            variableIndexOffset: 3,
            flagsOffset: 13,
            fixedIndexOffset: 14,
            sizeOffset: 16,

            entrySize: 18,
        },
        columnNames: {
            nameLengthSize: 1,
        },

        usageMapOffset: 35,
    },
};
