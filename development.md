# Notes for development of `mdb-reader`

-   Do not use the global `Buffer` outside of functions. This may cause issues in browsers if the Buffer-polyfill wasn't imported yet.

Run `npm ci`, `npm run lint`, `npm run build`, and `npm test` to validate changes.
Oxlint runs separately on the development Node version in CI. Vitest 3 and Vite 6
retain coverage for the oldest supported runtime, Node 22.11.0. Tests are type-checked
with TypeScript 7 and run against both the Node and browser environment implementations.
TypeScript 7 no longer supplies the legacy editor SDK at `node_modules/typescript/lib`.

The SvelteKit example uses TypeScript 6 until Svelte's tooling supports TypeScript 7's
compiler API. Validate it with `npm run check` and `npm run build` in `examples/sveltekit`.
