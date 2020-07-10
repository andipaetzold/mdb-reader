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
