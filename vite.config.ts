import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
	base: '/ForeverSim/',
	plugins: [react()],
	resolve: {
		tsconfigPaths: true,
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use "/src/variables.scss" as *;`,
			},
		},
	},
});
