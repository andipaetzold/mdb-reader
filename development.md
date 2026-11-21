# Notes for development of `mdb-reader`

-   Do not use the global `Buffer` outside of functions. This may cause issues in browsers if the Buffer-polyfill wasn't imported yet.
