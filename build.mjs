import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const file of ['index.html', 'player.html', 'style.css', 'favicon.svg', 'THIRD_PARTY.md', 'LICENSE']) await copyFile(file, `dist/${file}`);
for (const dir of ['src', 'vendor', 'games', 'licenses', 'sources']) await cp(dir, `dist/${dir}`, { recursive: true });
console.log('Built self-hosted DOS edition in dist/');
