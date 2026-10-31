import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';

const playwrightPath = process.env.PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
if (!existsSync(playwrightPath)) {
  console.log('Browser test skipped: set PLAYWRIGHT_MODULE to Playwright’s index.mjs.');
  process.exit(0);
}

const { chromium } = await import(playwrightPath);
const server = spawn(process.execPath, ['server.mjs'], {
  cwd: new URL('..', import.meta.url),
  env: { ...process.env, PORT: '4193' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
await once(server.stdout, 'data');

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));

const screenPath = '/tmp/kroz-browser-screen.png';
async function screenText() {
  await page.locator('#emulator').screenshot({ path: screenPath });
  return execFileSync('tesseract', [screenPath, 'stdout'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}
async function waitForScreen(pattern, timeout = 25_000) {
  const end = Date.now() + timeout;
  let text = '';
  while (Date.now() < end) {
    text = await screenText();
    if (pattern.test(text)) return text;
    await page.waitForTimeout(250);
  }
  throw new Error(`DOS screen did not match ${pattern}. Last OCR:\n${text}`);
}
async function key(value) {
  await page.keyboard.press(value);
  await page.waitForTimeout(150);
}
async function bootToLevel() {
  await waitForScreen(/Color or Monochrome/i); await key('c');
  await waitForScreen(/Slow or Fast PC/i); await key('s');
  await waitForScreen(/Press any key to continue/i); await key('Space');
  await waitForScreen(/Novice.*Experienced.*Advanced/is); await key('n');
  await waitForScreen(/Press any key/i); await key('Space');
  await waitForScreen(/KROZ.*REGISTER/i); await key('Space');
  await waitForScreen(/Begin your descent/i); await key('b');
  await waitForScreen(/begin this level/i);
  await key('Space');
}
async function databaseKeys() {
  return page.evaluate(async () => {
    const output = [];
    for (const info of await indexedDB.databases()) {
      if (!info.name) continue;
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(info.name);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      for (const name of db.objectStoreNames) {
        const keys = await new Promise((resolve, reject) => {
          const request = db.transaction(name).objectStore(name).getAllKeys();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        output.push(...keys.map(key => `${info.name}/${name}/${String(key)}`));
      }
      db.close();
    }
    return output;
  });
}

try {
  await page.goto('http://127.0.0.1:4193/');
  await page.locator('#launch').click();
  await page.waitForFunction(() => document.querySelector('#power')?.textContent.includes('ONLINE'), null, { timeout: 45_000 });
  await bootToLevel();

  const beforeWhip = await page.locator('#emulator').screenshot();
  await key('w');
  await page.waitForTimeout(350);
  const afterWhip = await page.locator('#emulator').screenshot();
  assert.notDeepEqual(beforeWhip, afterWhip, 'game framebuffer did not react to the whip key');

  await page.locator('#pause').click();
  await page.waitForTimeout(350);
  const frozenA = await page.locator('#emulator').screenshot();
  await page.waitForTimeout(1_500);
  const frozenB = await page.locator('#emulator').screenshot();
  assert.deepEqual(frozenA, frozenB, 'emulator framebuffer changed while paused');
  await page.locator('#resume').click();

  await key('s');
  await waitForScreen(/sure you want to SAVE/i); await key('y');
  await waitForScreen(/letter to SAVE/i); await key('a');
  await page.waitForTimeout(1_300);
  await page.locator('#pause').click();
  await page.waitForTimeout(1_200);
  const savedKeys = await databaseKeys();
  assert.ok(savedKeys.some(value => /KINGDOMA\.SAV/i.test(value)), `save slot missing from IndexedDB: ${savedKeys.join(', ')}`);
  await page.locator('#resume').click();

  await key('ArrowRight');
  await key('r');
  await waitForScreen(/sure you want to RESTORE/i); await key('y');
  await waitForScreen(/letter to RESTORE/i); await key('a');
  await waitForScreen(/begin this level/i);

  await page.setViewportSize({ width: 320, height: 760 });
  await page.reload();
  assert.ok((await databaseKeys()).some(value => /KINGDOMA\.SAV/i.test(value)), 'save slot did not survive a page reload');

  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.equal(await page.locator('#touch-panel').getAttribute('open'), '');
  await page.screenshot({ path: '/tmp/kroz-original-mobile.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('Original DOS game: boot, level 1, whip, true emulator pause, save, restore, persistence and 320px layout passed.');
} finally {
  await browser.close();
  server.kill();
}
