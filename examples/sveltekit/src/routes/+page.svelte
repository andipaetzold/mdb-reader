<script lang="ts">
	import { getTableNames } from '$lib/database';

	export let form;

	let files: FileList;
</script>

<form method="post" enctype="multipart/form-data">
	<input name="files" type="file" bind:files multiple accept=".mdb,.accdb" />
	<button type="submit">Upload</button>
</form>

{#if form?.files}
	<h2>Uploaded Files:</h2>
	{#each form.files as file}
		<p>
			{file.name}
			{#if file.tableNames.length}
				<ul>
					{#each file.tableNames as tableName}
						<li>{tableName}</li>
					{/each}
				</ul>
			{/if}
		</p>
	{/each}
{/if}

{#if files}
	<h2>Selected Files:</h2>
	{#each files as file}
		<p>
			{file.name}:
			{#await getTableNames(file) then tableNames}
				<ul>
					{#each tableNames as tableName}
						<li>{tableName}</li>
					{/each}
				</ul>
			{/await}
		</p>
	{/each}
{/if}
