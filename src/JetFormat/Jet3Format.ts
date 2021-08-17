import { CodecType, JetFormat } from "./types";

export const jet3Format: JetFormat = {
    legacyFormat: "Jet3",
    codecType: CodecType.JET,

    pageSize: 2048,

    textEncoding: "utf8",

    databaseDefinitionPage: {
        passwordSize: 20,
        decryptedSize: 126,
        defaultCollation: {
            offset: 0x3a,
            size: 2,
        },
    },

    dataPage: {
        recordCountOffset: 8,

        record: {
            countOffset: 8,

            columnCountSize: 1,
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
