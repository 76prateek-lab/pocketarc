# Offline Support

PocketArc is an installable, local-first PWA. `vite-plugin-pwa` generates the
manifest and Workbox service worker during production builds.

## Cached application resources

Workbox precaches the HTML application shell, compiled JavaScript and CSS,
self-hosted Geist fonts, application icons, and every required self-hosted
EmulatorJS/mGBA runtime file under `public/emulatorjs`. Navigation requests fall
back to the cached application shell, allowing routes to reopen offline.

Imported ROMs, normal saves, save states, screenshots, settings, and sessions
are not placed in Cache Storage. They remain in `PocketGBADB` through Dexie.
Workbox explicitly excludes `.gba`, `.gb`, `.gbc`, `.sav`, and `.state` files
from its precache, and the application never creates network requests for an
imported ROM Blob.

The curated catalog JSON and catalog cover artwork are application metadata and
may be precached. Catalog ROMs are deliberately excluded: metadata appears
first, and a ROM is fetched only after the user chooses **Install for Offline**.
PocketArc verifies its expected byte size and SHA-256, then stores it in
IndexedDB. Subsequent play uses the same local Blob loader as imported games and
does not require a catalog network request.

## Installation

`installService` captures the browser's `beforeinstallprompt` event. The
Install App action appears only while the browser supplies a valid prompt, so
unsupported browsers are not repeatedly nagged. Installed/standalone sessions
hide the action. Safari users can still install through the platform's Share →
Add to Home Screen flow.

## Updates

Service-worker updates use an explicit prompt. PocketArc reports “Update ready”
and never activates a waiting worker automatically. Outside gameplay, the user
can choose Update now. During an active emulator lifecycle, the action changes
to Update after game; activation is deferred until `EmulatorManager` returns to
`idle`. This prevents a new worker from reloading an active game.

Service-worker upgrades affect Cache Storage only. They do not clear or migrate
IndexedDB, so installing an update does not intentionally remove ROMs or saves.

## Verification

The production Playwright flow first warms the service worker, imports the
ignored legal homebrew fixture, creates save data, switches the browser context
offline, and verifies that the library, imported ROM, mGBA runtime, and save all
continue working without network access.
