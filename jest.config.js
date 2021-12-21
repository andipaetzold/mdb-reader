export default {
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testRegex: "^.+\\.spec\\.ts$",
    coverageDirectory: "test-results/coverage",
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.jest.json",
        },
    }
};
