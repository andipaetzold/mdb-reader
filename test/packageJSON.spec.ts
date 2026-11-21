import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

function getPathsFromPackageJSON(): string[] {
    const packageJSON = JSON.parse(readFileSync("package.json", "utf-8"));

    const flatten = (obj: unknown): string[] => {
        if (typeof obj !== "object" || !obj) {
            return [];
        }

        const values = Object.values(obj);
        return values.flatMap((value) => (typeof value === "string" ? [value] : flatten(value)));
    };

    const paths = [packageJSON["main"], packageJSON["browser"], packageJSON["types"], ...flatten(packageJSON["exports"])];

    return paths;
}

describe("package.json", () => {
    it("all entry points exist", () => {
        const paths = getPathsFromPackageJSON();

        for (const path of paths) {
            expect(existsSync(path), `Path ${path} does not exist`).toBe(true);
        }
    });

    it.each([
        ["Node16", "Node16"],
        ["Bundler", "ESNext"],
    ])("type-checks a consumer of all built entries with %s resolution", (resolution, module) => {
        execFileSync(process.execPath, [
            "node_modules/typescript/bin/tsc",
            "--ignoreConfig",
            "--noEmit",
            "--strict",
            "--target", "ES2022",
            "--types", "node",
            "--module", module,
            "--moduleResolution", resolution,
            "test/package-types.mts",
        ], { stdio: "inherit" });
    });
});
