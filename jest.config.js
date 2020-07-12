module.exports = {
    displayName: "MDB Reader",
    reporters: [
        'default',
        [
            'jest-junit',
            {
                suiteName: 'MDB Reader',
                outputDirectory: 'test-results',
            },
        ],
    ],
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
