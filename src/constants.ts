import { Format, getFormat } from "./format";

export interface Constants {
    format: Format;
    pageSize: number;

    dataPage: {
        rowCountOffset: number;
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

            variableOffsetOffset: number;
            fixedOffsetOffset: number;

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
        rowCountOffset: 0x08,
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
            variableOffsetOffset: 3,
            flagsOffset: 13,
            fixedOffsetOffset: 14,
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
        rowCountOffset: 0x0c,
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
            variableOffsetOffset: 7,
            flagsOffset: 15,
            fixedOffsetOffset: 21,
            sizeOffset: 25,

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
