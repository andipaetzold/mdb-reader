module.exports = {
    roots: ["<rootDir>/src"],
    displayName: "MDB Reader",
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testRegex: "^.+\\.spec\\.ts$",
};
