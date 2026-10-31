import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const file of ['index.html', 'style.css', 'favicon.svg']) await copyFile(file, `dist/${file}`);
await cp('src', 'dist/src', { recursive: true });
console.log('Built static site in dist/');
