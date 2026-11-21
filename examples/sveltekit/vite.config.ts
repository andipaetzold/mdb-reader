import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		nodePolyfills({
			include: ['buffer', 'stream', 'util'],
			globals: { Buffer: true }
		}),
		sveltekit({
			adapter: adapter(),
			preprocess: vitePreprocess()
		})
	]
});
