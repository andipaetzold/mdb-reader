import { Buffer } from 'buffer';
import MDBReader from 'mdb-reader';

globalThis.Buffer = Buffer;

export async function getTableNames(file: File) {
	const buffer = Buffer.from(await file.arrayBuffer());
	const reader = new MDBReader(buffer);
	return reader.getTableNames();
}
