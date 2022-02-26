declare module "browserify-aes/browser.js" {
    import { createDecipheriv as nodeCreateDecipheriv } from "crypto";

    export const createDecipheriv: typeof nodeCreateDecipheriv;
}
