module.exports = {
    reporters: [
        "default",
        [
            "jest-junit",
            {
                suiteName: "MDB Reader",
                outputDirectory: "test-results/junit",
            },
        ],
    ],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testRegex: "^.+\\.spec\\.ts$",
    coverageDirectory: "test-results/coverage",
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.jest.json",
        },
    },
};
