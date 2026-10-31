# Kroz Time

A compact browser tribute to the spirit of **Kingdom of Kroz**: chunky pixels, turn-based dungeon crawling, gems as life, and a very useful whip. Five original chambers lead to the lost crown. All maps, visuals, and sounds are generated locally; no original game assets are included.

## Play locally

Requires Node.js 22 or newer. No dependency installation is necessary.

```sh
npm start
```

Open port 4173 in your browser. Arrow keys or WASD move, Space whips the eight surrounding cells, `.` waits, and P or Escape pauses. Touch controls appear on narrow screens. Find each chamber's key before using its stairs; claim the crown in the fifth chamber. Gems replenish life, elixirs heal, boulders can be pushed, and paired runes teleport. Sound is optional. Personal best is stored locally when browser storage is available.

## Validate and build

```sh
npm test
npm run build
SERVE_DIST=1 npm start
```

Tests cover resource collection, blocking, enemy timing, damage/death, whips, boulders, teleporters, victory, map connectivity, and a complete winning campaign with active enemies. The build copies only browser assets into `dist/`. No bundler, framework, CDN, API, or production dependencies.

## Public deployment

The included GitHub Actions workflow tests, builds, and deploys `dist/` to GitHub Pages on pushes to `main`. In repository **Settings → Pages**, select **GitHub Actions** as the source before running the workflow. The intended project address is `https://batemapf.github.io/kroz-time/`; deployment status must be verified before treating it as live. Any static host can also serve the contents of `dist/`. All asset references are relative, including support for a project subpath.

## Structure

- `src/engine.js`: deterministic game rules, with no DOM dependencies.
- `src/levels.js`: five reproducible original chamber layouts.
- `src/render.js`: pixel-art Canvas renderer.
- `src/app.js`: keyboard/touch controls, UI, synthesized sound, local best score.
- `test/engine.test.js`: Node's built-in test runner.

Independent fan tribute; not affiliated with Scott Miller or Apogee. Kroz is credited to its original creator. This project uses original code, maps, and artwork.
