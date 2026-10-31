import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
await import('../src/pause.js');
const pauseController = globalThis.KrozPauseController;

test('vendored emulator, original game and corresponding source archives match pinned hashes',async()=>{
 const integrity=JSON.parse(await readFile(new URL('../vendor/integrity.json',import.meta.url)));
 for(const [file,hash] of Object.entries(integrity))assert.equal(createHash('sha256').update(await readFile(new URL('../'+file,import.meta.url))).digest('hex'),hash,file);
});
test('emulator pause holds its next wake-up and resumes it exactly once',async()=>{
 const events=[];const dos={sync_sleep:cb=>cb(),pause:()=>events.push('pause'),resume:()=>events.push('resume')};
 const p=pauseController(dos);dos.sync_sleep(()=>events.push('running'));p.pause();p.pause();dos.sync_sleep(()=>events.push('wake'));assert.deepEqual(events,['running','pause']);p.resume();p.resume();await new Promise(r=>setTimeout(r,10));assert.deepEqual(events,['running','pause','resume','wake']);
});
test('static server serves emulator/archive MIME types and survives missing/malformed paths',async t=>{
 const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4192'},stdio:['ignore','pipe','pipe']});
 t.after(()=>child.kill());await once(child.stdout,'data');
 for(const [path,type] of [['/','text/html'],['/player.html','text/html'],['/vendor/js-dos/wdosbox.wasm.js','text/javascript'],['/games/kingdom.zip','application/zip'],['/licenses/kroz-GPL-2.0.txt','text/plain'],['/sources/js-dos-6.22.60-source.tar.gz','application/gzip']]){const r=await fetch('http://127.0.0.1:4192'+path);assert.equal(r.status,200,path);assert.equal(r.headers.get('content-type'),type);await r.arrayBuffer();}
 for(const path of ['/missing.js','/%ZZ','/.git/config','/package.json','/%2e%2e%2fetc/passwd']){const r=await fetch('http://127.0.0.1:4192'+path);assert.equal(r.status,404,path);}
 assert.equal((await fetch('http://127.0.0.1:4192/')).status,200);
});
