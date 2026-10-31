import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.env.SERVE_DIST ? 'dist' : '.');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.zip': 'application/zip', '.txt': 'text/plain', '.png': 'image/png', '.wasm': 'application/wasm', '.gz': 'application/gzip', '.json': 'application/json', '.md': 'text/plain' };
createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) throw new Error('path');
    const file = path === root ? resolve(root, 'index.html') : path;
    const relative = file.slice(root.length + 1);
    const publicFile = ['index.html','player.html','style.css','favicon.svg','THIRD_PARTY.md','LICENSE'].includes(relative) || /^(src|vendor|games|licenses|sources)\//.test(relative);
    if (!publicFile || (!types[extname(file)] && relative !== 'LICENSE')) throw new Error('file');
    const contents = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'text/plain', 'Cache-Control': 'no-cache' });
    res.end(contents);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT || 4173), '0.0.0.0', () => console.log('Kroz listening on port ' + (process.env.PORT || 4173)));
