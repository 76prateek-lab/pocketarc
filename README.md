# PocketArc

A private, installable Game Boy Advance library powered by React, TypeScript, Dexie, EmulatorJS, and the mGBA WebAssembly core.

## Run locally

```bash
npm install
npm run dev
```

ROMs and save data remain in browser storage. Only use game files you are legally entitled to use.

## ROM policy

PocketArc supports user imports and an optional curated catalog. User-imported
files are stored locally in IndexedDB and are never uploaded. Catalog binaries
are included only when the project owner confirms public redistribution rights;
their exact paths, sizes, and SHA-256 values are verified during every build.

For development, place permitted test or homebrew ROMs in `private-roms/`.
Repository ignore rules prevent private ROMs, cartridge saves, and emulator
states from being committed. The only `.gba` exception is the checksum-locked
set under `public/catalog/roms/`.

## Deploy to Cloudflare Pages

PocketArc is ready for a static GitHub-to-Cloudflare Pages deployment. Use
production branch `main`, build command `npm run build`, and output directory
`dist`. No environment variables, redirects, Workers, or Pages Functions are
required.

See the beginner-friendly [Cloudflare Pages deployment guide](docs/CLOUDFLARE_PAGES.md)
for the complete dashboard walkthrough, custom-domain setup, verification
steps, and troubleshooting.

### Deployment checks

- Open `/`, `/game/nonexistent`, and `/play/nonexistent` directly in new tabs.
  Each route must return the PocketArc application rather than a platform 404.
- Confirm `/emulatorjs/frame.html` is HTML, runtime `.js` files are JavaScript,
  JSON files are JSON, and
  `/emulatorjs/data/compression/libunrar.wasm` is served as
  `application/wasm`.
- Import a permitted `.gba`, play it, create a normal save and save state, then
  reload the nested game route. The ROM and saves must still be present.
- Install the PWA, launch it once online, close it, disconnect the network, and
  confirm the library and imported game launch offline.
- Check desktop and mobile layouts and verify normal gameplay produces no
  console errors.

ROMs imported by users are written only to browser IndexedDB. They are never
part of the Cloudflare build, Workbox cache, or an upload request. Catalog ROMs are
deployment assets but are excluded from Workbox precaching; they are fetched
only after a visitor chooses **Install for Offline**, verified, and then stored
in IndexedDB.

### Emulator threading decision

EmulatorJS threaded mode is intentionally disabled. The checked-in mGBA runtime
contains the standard and legacy single-threaded core packages, not a threaded
core package. Enabling threads would therefore add cross-origin isolation
requirements without providing a verified runtime benefit. PocketArc does not
send `Cross-Origin-Opener-Policy` or `Cross-Origin-Embedder-Policy` headers.
Re-evaluate threaded mode only with a matching self-hosted threaded core and a
full compatibility pass for the PWA, Blob ROM URLs, fonts, and every other
loaded resource.
