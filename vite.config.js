import { defineConfig } from 'vite';

const base = process.env.VITE_BASE_PATH || '/learning-site/';

export default defineConfig({
  base,
});
