import { getTableNames } from '$lib/database';

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const files = formData.getAll('files').map(async (file) => {
			if (file instanceof File) {
				return {
					name: file.name,
					tableNames: await getTableNames(file)
				};
			} else {
				return {
					name: file,
					tableNames: []
				};
			}
		});
		return { files: await Promise.all(files) };
	}
};
