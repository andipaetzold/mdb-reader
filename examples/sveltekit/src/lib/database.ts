import MDBReader from 'mdb-reader';

export async function getTableNames(file: File) {
	// Use Node's native Buffer on the server and the injected polyfill in the browser.
	const buffer = (globalThis.Buffer ?? Buffer).from(await file.arrayBuffer());
	const reader = new MDBReader(buffer);
	return reader.getTableNames();
}
