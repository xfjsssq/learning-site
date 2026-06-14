const { copyFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const distIndex = join(process.cwd(), 'dist', 'index.html');
const dist404 = join(process.cwd(), 'dist', '404.html');

if (!existsSync(distIndex)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

copyFileSync(distIndex, dist404);
console.log('Copied index.html -> 404.html for GitHub Pages SPA routing');
