import BrowserMDBReader from "../src/browser.js";
import NodeMDBReader from "../src/node.js";

export const readers = [
    { platform: "Node", MDBReader: NodeMDBReader },
    { platform: "browser", MDBReader: BrowserMDBReader },
];
