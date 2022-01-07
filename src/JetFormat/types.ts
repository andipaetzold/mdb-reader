export interface JetFormat {
    pageSize: number;

    textEncoding: "utf8" | "ucs-2";

    databaseDefinitionPage: {
        encryptedSize: number;
        passwordSize: number;

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
