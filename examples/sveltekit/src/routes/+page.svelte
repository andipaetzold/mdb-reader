<script lang="ts">
    import { getTableNames } from "$lib/database.js";

    let { form } = $props();

    let files: FileList | undefined = $state();
</script>

<form method="post" enctype="multipart/form-data">
    <input name="files" type="file" bind:files multiple accept=".mdb,.accdb" />
    <button type="submit">Upload</button>
</form>

{#if form?.files}
    <h2>Uploaded Files:</h2>
    {#each form.files as file}
        <section>
            {file.name}
            {#if file.tableNames.length}
                <ul>
                    {#each file.tableNames as tableName}
                        <li>{tableName}</li>
                    {/each}
                </ul>
            {/if}
        </section>
    {/each}
{/if}

{#if files}
    <h2>Selected Files:</h2>
    {#each files as file}
        <section>
            {file.name}:
            {#await getTableNames(file) then tableNames}
                <ul>
                    {#each tableNames as tableName}
                        <li>{tableName}</li>
                    {/each}
                </ul>
            {/await}
        </section>
    {/each}
{/if}
