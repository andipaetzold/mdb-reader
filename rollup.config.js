import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";

export default {
    input: "src/index.ts",
    output: [
        {
            file: pkg.main,
            format: "cjs",
            exports: 'default',
        },
        {
            file: pkg.module,
            format: "es",
        },
    ],
    plugins: [
        typescript({
            typescript: require("typescript"),
        }),
        terser({
            output: {
                comments: false,
            },
        }),
    ],
};
