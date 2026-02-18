import type { SortOrder } from "../types.js";

export interface JetFormat {
    codecType: CodecType;

    pageSize: number;

    textEncoding: "unknown" | "ucs-2";

    defaultSortOrder: Readonly<SortOrder>;

    databaseDefinitionPage: {
        encryptedSize: number;
        passwordSize: number;

        creationDateOffset: number | null;

        defaultSortOrder: {
            offset: number;
            size: number;
        };
    };

    dataPage: {
        recordCountOffset: number;

        record: {
            countOffset: number;

            columnCountSize: number;
            variableColumnCountSize: 1 | 2;
        };
    };

    tableDefinitionPage: {
        rowCountOffset: number;

        columnCountOffset: number;
        variableColumnCountOffset: number;

        logicalIndexCountOffset: number;
        realIndexCountOffset: number;

        realIndexStartOffset: number;
        realIndexEntrySize: number;

        columnsDefinition: {
            typeOffset: number;
            indexOffset: number;
            flagsOffset: number;
            sizeOffset: number;

            variableIndexOffset: number;
            fixedIndexOffset: number;

            entrySize: number;

            /**
             * Offset of the 4-byte complex type ID in the column definition. Omit if not supported.
             */
            complexTypeIdOffset?: number;
        };
        columnNames: {
            /**
             * Number of bytes that store the length of the column name
             */
            nameLengthSize: number;
        };

        usageMapOffset: number;
    };
}

export const enum CodecType {
    JET,
    MSISAM,
    OFFICE,
}
