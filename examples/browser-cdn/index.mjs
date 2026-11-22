import { Buffer } from "https://cdn.jsdelivr.net/npm/buffer@6.0.3/+esm";
import MDBReader from "https://cdn.jsdelivr.net/npm/mdb-reader@3.2.2/+esm";

const button = document.getElementById("button");
const input = document.getElementById("input");
const tableNames = document.getElementById("tableNames");

button.addEventListener("click", loadTableNames);
function loadTableNames() {
    tableNames.innerHTML = "";

    const files = input.files;
    if (files.length !== 1) {
        return;
    }
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (e) => handleBuffer(e.target.result);
    reader.readAsArrayBuffer(file);
}

function handleBuffer(buffer) {
    const reader = new MDBReader(Buffer.from(buffer));

    for (const tableName of reader.getTableNames()) {
        const item = document.createElement("li");
        item.innerText = tableName;
        tableNames.appendChild(item);
    }
}
