# Preservation, licensing, and provenance

## Kingdom of Kroz II

Copyright (C) 1987–2009 Apogee Software, Ltd. Original program by Scott Miller.
Prepared for source release March 19, 2009 by Joe Siegler.

This edition uses the **source-release** copy of `source/KROZTRLI/KINGDOM/KINGDOM.EXE`, unmodified, from:

https://github.com/tangentforks/kroz/tree/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/KROZTRLI/KINGDOM

SHA-256: `165d823a3d765a04a427c3d493d69caf690c2d8b81005f9cef2247ebec3c55a7`

The corresponding `KINGDOM.PAS` and `KINGDOM1.INC` through `KINGDOM5.INC`, together with the executable, original release notes and license, are provided in `sources/kingdom-source.zip`. These sources carry GPL version 2 or later notices. See `licenses/kroz-GPL-2.0.txt` and `licenses/kroz-source-release.txt`. The archived source specifies Turbo Pascal 5 and its CRT, DOS and Turbo3 units; compile the five unit files (using `.PAS` filenames in a working copy) before the main program. No compiler or proprietary runtime development tools are redistributed here.

The source release and the separately packaged freeware release have different terms. This project uses the executable distributed **inside the GPL source tree**, not the separately packaged retail/freeware executable, and supplies that tree's corresponding sources without modification. Kroz remains a trademark of Apogee. Historical registration screens are preserved as part of the game, not presented as current instructions. This browser edition is independent and unaffiliated.

## js-dos / DOSBox

js-dos 6.22.60, Alexander Guryanov and contributors; DOSBox copyright 2002–2015 DOSBox Team. Distributed under GNU GPL version 2 as included in the upstream LICENSE. The npm package metadata says ISC, but its actual LICENSE and DOSBox notices are GPL; we preserve and comply with the distributed GPL text.

Runtime files `js-dos.js`, `wdosbox.js`, `wdosbox.wasm.js` are unmodified copies from the npm archive:

https://registry.npmjs.org/js-dos/-/js-dos-6.22.60.tgz

Its SHA-512 integrity was verified against the npm registry before extraction:

`sha512-1EhfMftOhBZ34Gvz/RCLsAoEcgWcZ1pmumpG28Z+9oQ9oQVP90jckQpvS9NW7vvfwYJWmCj+PX+j3UO44iO6LA==`

The complete upstream source at the package's declared gitHead, `d9d1045ef321bcde3f061dc8e686ded890147d6a` (tag `6.22.60`), is provided in `sources/js-dos-6.22.60-source.tar.gz`. It includes the DOSBox fork, bundled third-party libraries, TypeScript adapter, build scripts, package lockfiles and license notices. Build instructions and dependencies are in the upstream README and CMakeLists; the WebAssembly build uses Emscripten/CMake and the adapter uses the upstream npm/gulp toolchain.

https://github.com/caiiiycuk/js-dos/tree/d9d1045ef321bcde3f061dc8e686ded890147d6a

See `licenses/js-dos-GPL-2.0.txt`. Sources and licenses are served alongside the game and linked from the page. `vendor/integrity.json` records hashes of the runtime and archives for reproducibility.

## Browser wrapper

The Kroz Time browser wrapper is licensed under GPL version 2 or later; see LICENSE. It supplies controls and a persistent browser filesystem, and does not modify the DOS program, its levels, or its gameplay. There is no warranty.
