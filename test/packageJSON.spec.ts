import { readFileSync, existsSync } from "node:fs";
import { it } from "mocha";
import { expect } from "chai";

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
            expect(existsSync(path), `Path ${path} does not exist`).to.be.true;
        }
    });
});
