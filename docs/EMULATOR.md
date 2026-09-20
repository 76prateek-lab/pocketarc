# Emulator

PocketArc uses the self-hosted EmulatorJS 4.2.3 runtime with its mGBA core.
Runtime assets are vendored under `public/emulatorjs/data`; production builds
fail when required files are missing. No runtime CDN is used.

## SPA isolation

EmulatorJS officially recommends an iframe for React and other single-page
applications because its loader owns and modifies its document. `PlayPage`
provides `#emulator-root`, and `EmulatorJSAdapter` mounts exactly one same-origin
iframe inside it. Required `EJS_*` globals exist only in that frame.

The parent and frame communicate through a small, origin-checked `postMessage`
bridge. PocketArc owns routing and the outer controls; EmulatorJS owns video,
audio, keyboard input, and its start gesture inside the frame.

## Lifecycle

`EmulatorManager` has an explicit state machine:

`idle → preparing → loading → ready → running ⇄ paused → destroying → idle`

Any active state may transition to `error` when loading or runtime work fails.
Launching another game first destroys the existing adapter. Destroying removes
the iframe and listeners and revokes the ROM Blob URL, so an old canvas, audio
context, or core cannot remain mounted.

The GBA BIOS is intentionally unset because EmulatorJS documents it as optional
for GBA.

## Save bridge

All save integration stays behind `EmulatorManager`, `EmulatorJSAdapter`, and
`saveBridge.ts`. The same-origin frame forwards normal-save updates and
requested state snapshots as transferable buffers. React never accesses
EmulatorJS globals.

Normal saves are restored after the core starts, ignored when empty, debounced
before IndexedDB writes, and flushed on visibility changes, page hide, and
orderly emulator destruction. State creation uses EmulatorJS's core state and
screenshot APIs. Auto, numbered, and Quick slots are stored independently per
game. A state can only be loaded when its `gameId` matches the active game.

## Product shell and platform services

PocketArc owns the visible play experience. The self-hosted frame exposes only
the required start gesture and gameplay canvas; pause, restart, volume,
fullscreen, screenshots, saves, and navigation are routed through the adapter.
The desktop toolbar and mobile quick menu therefore share one typed command
path instead of manipulating EmulatorJS globals.

`FullscreenService` contains standard Fullscreen API handling and the older
WebKit fallback used by some Safari versions. `WakeLockService` treats screen
wake lock as an optional enhancement: it is requested only while gameplay is
running, released while paused or hidden, and reacquired after visible play
resumes. Browser rejection never prevents gameplay.

`PlaytimeService` opens a session when the core actually starts, records only
visible running segments, and atomically updates the session plus the game's
`totalPlayTimeMs` and `lastPlayedAt`. Manual screenshots are stored in the
screenshots repository and remain local.

## Advanced local features

PocketArc uses the bundled runtime's public `takeScreenshot`, `setFastForwardRatio`, `toggleFastForward`, `setCheat`, `resetCheat`, and `enableShader` paths. Fast-forward is intentionally limited to 1x, 2x, and 4x. Cheats live in their own versioned IndexedDB table keyed by game and never share the normal save or settings records. Display choices map only to bundled shaders: Original disables shaders, Sharp Pixels uses `2xScaleHQ.glslp`, and Smooth uses `bicubic`. An LCD-like option is hidden because the bundled shader set does not provide a restrained LCD preset.

Rewind: **Deferred — current emulator adapter does not expose a stable rewind API.** EmulatorJS 4.2.3 contains internal rewind configuration and core bindings, but its adapter-facing manager does not expose a supported toggle with lifecycle guarantees. PocketArc does not call private runtime functions or fake rewind.
