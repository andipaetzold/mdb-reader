declare module "create-hash" {
    import { createHash as nodeCreateHash } from "crypto";

    const createHash: typeof nodeCreateHash;
    export default createHash;
}
