module.exports = {
    displayName: "MDB Reader",
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testRegex: "^.+\\.spec\\.ts$",
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.jest.json",
        },
    },
};
