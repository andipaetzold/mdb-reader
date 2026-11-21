import { environment } from "./environment/browser.js";
import BaseMDBReader, { type Options } from "./MDBReader.js";

export * from "./index.js";

export default class MDBReader extends BaseMDBReader {
    /**
     * @param buffer Buffer of the database.
     */
    constructor(buffer: Buffer, options: Options = {}) {
        super(buffer, environment, options);
    }
}
