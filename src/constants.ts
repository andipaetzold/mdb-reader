import { Format, getFormat } from "./format";

export interface Constants {
    format: Format;
    pageSize: number;

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

const jet3Constants: Constants = {
    format: "Jet3",
    pageSize: 2048,

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

const jet4Constants: Constants = {
    format: "Jet4",
    pageSize: 4096,
    dataPage: {
        recordCountOffset: 12,

        record: {
            countOffset: 12,

            columnCountSize: 2,
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

export function getConstants(buffer: Buffer) {
    switch (getFormat(buffer)) {
        case "Jet3":
            return jet3Constants;
        case "Jet4":
            return jet4Constants;
        default:
            throw new Error("Unsupported database format");
    }
}
