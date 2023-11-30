import MDBReader from 'mdb-reader';

export async function getTableNames(file: File) {
	const buffer = Buffer.from(await file.arrayBuffer());
	const reader = new MDBReader(buffer);
	return reader.getTableNames();
}
