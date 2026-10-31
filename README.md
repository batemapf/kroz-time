# Kroz Time — original DOS edition

Play **Kingdom of Kroz II**, Scott Miller's original 1990 DOS game, inside a small SPA. It includes the exact level-four “BIG TROUBLE” map, 25 original levels, EGA character graphics, real-time enemies, PC-speaker audio, whips, teleports, and the original save/restore system.

Public site: https://batemapf.github.io/kroz-time/

The earlier JavaScript reimagining is preserved in Git history through commit `cb8eb8e`. The current version runs the unmodified source-release DOS executable in self-hosted js-dos/DOSBox. There is one vendored runtime dependency and no npm install, CDN, backend, analytics or account requirement.

## Run and build

Node.js 22+:

```sh
npm start
npm test
npm run build
SERVE_DIST=1 PORT=4174 npm start
```

Open port 4173 for development, or 4174 for the built site. `dist/` is a static site with relative URLs and works under the `/kroz-time/` Pages subpath. GitHub Actions tests, builds, and deploys pushes to `main`.

## Start playing

Click **Boot original game**. At the original DOS prompts choose **C** (color), **S** (slow PC). Continue through the title with Space, select **N** (novice), continue through the remaining screens, then **B** (begin). Each level waits for a keypress before enemies start moving.

- Arrow keys move. Home / Page Up / End / Page Down move diagonally.
- **W** whip, **T** teleport, **P** game pause (any key resumes).
- **S** saves; **R** restores. Answer **Y**, then choose slot **A**, **B**, or **C**.
- Original saves restart the current level, not the exact instant you saved.
- **I** opens instructions at the original main menu.
- On-screen buttons include all menu keys and an eight-way movement pad.
- The wrapper's emulator pause freezes the machine independently of the game's P pause.
- Reboot discards unsaved progress but preserves saved slots in IndexedDB on this browser/origin. Private browsing or clearing site data may remove saves.

This is real-time, not turn-based. DOSBox uses 1200 fixed cycles for a playable vintage speed. Keyboard input goes to the game after clicking its screen. The screen is displayed at a 4:3 monitor aspect ratio with nearest-neighbor pixel scaling.

## Tests

`npm test` verifies static serving, missing-file handling, path restrictions and the checked-in runtime/archive hashes. Browser integration tests use Playwright with a locally installed Chromium and Tesseract OCR to inspect the actual emulated DOS display. Playwright is only a test tool, not shipped with the site:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs npm run test:browser
```

The browser suite starts its own server and exercises actual DOS startup, gameplay, pause, native save/restore and responsive touch controls. No debug game mode is needed by the published application.

## Source and licensing

See [THIRD_PARTY.md](THIRD_PARTY.md) for exact upstream revisions, checksums and attribution. The source-release executable, matching preserved Pascal sources, and js-dos/DOSBox source are distributed with GPL notices and downloadable source archives. Game assets and runtime are served locally; nothing is loaded from an external site during play. Historical shareware advertisements inside the game are archival, not current purchase instructions.
