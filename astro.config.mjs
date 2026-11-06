import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cauce.study',
  output: 'static',
  vite: {
    build: {
      // three.js is a single ~525 kB chunk (~128 kB gzip), loaded only by the hero island.
      chunkSizeWarningLimit: 600,
    },
  },
});
