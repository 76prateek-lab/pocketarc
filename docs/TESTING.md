# Production QA

Last audited: 2026-09-18

## Release status

The automated production gate passes. Native-device release sign-off is still
required for Safari offline relaunch, physical-controller behavior, and real
mobile audio/fullscreen policies. Those environments cannot be represented
fully by desktop browser emulation, so they are not recorded as passing.

## Automated results

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run test` | Passed |
| `npm run test:e2e` | Passed: 99, skipped: 13 |
| `npm run build` | Passed |
| ROM policy verification | Passed; 0 unauthorized catalog ROMs |
| Emulator asset verification | Passed; 14 required assets |

The build has one non-blocking advisory: the primary JavaScript chunk is over
Vite's 500 kB warning threshold. Route-level code splitting should be considered
before the application grows further.

## Browser matrix

Automated Playwright projects:

- Chromium desktop at 1440×1000 (Chrome-compatible engine)
- Firefox desktop
- WebKit desktop (Safari-compatible engine)
- Chromium Pixel 5 emulation (Android Chrome-compatible)
- WebKit iPhone 13 emulation
- WebKit iPad Pro 11 emulation

Microsoft Edge was not installed on the QA host. Native Safari is installed but
is not controlled by Playwright; WebKit 26.6 was used for automation instead.
Physical Android, iPhone, iPad, and controller hardware were not available.

Playwright WebKit has an automation limitation in this environment: switching
its context offline and reloading causes an internal engine error before
application code runs. The WebKit offline-reload case is skipped and remains a
native Safari/iOS manual release gate. Chromium and Firefox offline application,
ROM, emulator, and save recovery tests pass.

## Resolution matrix

Automated horizontal-overflow and focus checks cover widths:

`320, 360, 375, 390, 430, 480, 600, 768, 1024, 1200, 1400, 1920`

Touch-layout reachability additionally covers 320×568, 360×800, 375×812,
390×844, 430×932, 768×1024, and 1024×768. Mobile target measurements verify an
approximately 44 CSS pixel interactive dimension.

## Functional coverage

Automated browser flows cover fresh storage, ROM import, duplicate detection,
multi-file import, deletion, metadata editing, cover persistence, catalog
installation, checksum verification, emulator boot, audio-context activation,
keyboard input, touch layouts, normal saves, reload, save states, quick save,
quick load, screenshots, fullscreen where supported, offline launch/play,
backup, destructive clear, restore, settings validation, and PWA readiness.
Deployment smoke coverage additionally verifies direct `/game/:id` and
`/play/:id` responses, static runtime precedence, JavaScript/JSON/WebAssembly
MIME types, and the WebAssembly binary signature.

Unit coverage additionally verifies simultaneous input, controller disconnect
cleanup, gamepad animation-frame cancellation, wake-lock denial/release,
playtime accounting, object-URL revocation, single-emulator mounting, dialog
focus restoration, accessible names, settings repair, storage-quota failure,
IndexedDB import failure, malformed backups, and repository isolation.

PWA update deferral logic is covered at the service/component boundary. A real
installed-PWA update arriving during a long-running native mobile session still
requires manual release testing.

## Stress and lifecycle coverage

- Imports and searches a 30-ROM synthetic library in every browser project.
- Starts, exits, reloads, and starts the emulator again with one legal ignored
  homebrew ROM.
- Creates quick and named save states and persists their screenshots.
- Switches portrait and landscape touch layouts across the required sizes.
- Simulates gamepad disconnect and window focus loss.
- Exercises document visibility and route-exit cleanup paths.
- Verifies quota/permission rejection and IndexedDB write failure handling.

Code audit confirmed that ROM bytes are not held in React state; WebKit-safe
ArrayBuffers are stored in IndexedDB and converted to a Blob only when a
consumer needs one. Emulator route cleanup removes its iframe, message
listeners, gamepad loop, input listeners, wake lock, playtime service, and ROM
object URL. Cover and screenshot hooks revoke replacement URLs.

## Defects corrected during QA

1. WebKit rejected IndexedDB `Blob`/`File` values. Binary records now persist as
   structured-clone-safe ArrayBuffers and are converted at consumption edges.
2. Mobile WebKit could hang while EmulatorJS generated a save-state preview.
   Preview capture is bounded and falls back to direct canvas capture; state
   data is never blocked indefinitely by an optional preview.
3. Firefox exposed horizontal overflow in Settings at 320 px. Range and mapping
   grid columns now shrink safely.
4. Browser tests inferred navigation mode from device labels rather than the
   active viewport. Assertions now use rendered viewport width.

## Manual release checklist

- Native macOS Safari: install, import, play, save, quit, disconnect network,
  relaunch, play, and restore the save.
- Physical iPhone and iPad: repeat the offline flow; rotate repeatedly; verify
  audio gesture, safe areas, background/foreground, touch combinations, and
  browser-permitted fullscreen behavior.
- Physical Android Chrome: repeat offline and background/foreground flows.
- Microsoft Edge: repeat import, emulator, save, backup, and offline smoke tests.
- Physical gamepad: connect, remap, play combinations, disconnect during play,
  reconnect, and confirm no stuck inputs or polling after exit.
- PWA update: stage a new service worker during gameplay and verify “Update
  after game” never reloads the active emulator.
- Constrained device storage: fill origin storage near quota and confirm writes
  fail visibly without replacing known-good saves.
