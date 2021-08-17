/**
 * @deprecated
 */
export type LegacyFormat = "Jet3" | "Jet4";

export const enum CodecType {
    JET,
    MSISAM,
    OFFICE,
}

export interface JetFormat {
    legacyFormat: LegacyFormat;
    codecType: CodecType;

    pageSize: number;

    textEncoding: "utf8" | "ucs-2";

    databaseDefinitionPage: {
        passwordSize: number;
        decryptedSize: number;

        defaultCollation: {
            offset: number;
            size: number;
        };
    };

    dataPage: {
        recordCountOffset: number;

        record: {
            countOffset: number;

            columnCountSize: number;
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
