import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/**/*.spec.ts", "test/**/*.spec.ts"],
        // Database and password fixtures can be slow on CI.
        testTimeout: 15000,
    },
});
