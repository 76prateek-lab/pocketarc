# PocketArc — Codex Development Rules

## Project purpose

PocketArc is an offline-first, responsive Game Boy Advance web emulator frontend.

The application does not implement CPU, GPU, sound or Game Boy Advance emulation itself.

Emulation must be provided through EmulatorJS using the mGBA core.

The application layer provides:

* game library management
* local ROM importing
* local ROM storage
* save management
* save states
* screenshots
* keyboard controls
* touch controls
* gamepad controls
* fullscreen
* playtime tracking
* display settings
* offline PWA support
* backup and restore

## Source of truth

Before editing UI, read `/DESIGN.md`.

`DESIGN.md` is authoritative for:

* colors
* typography
* spacing
* borders
* shadows
* radii
* focus behavior
* component states
* responsive behavior
* motion

Do not invent a competing visual language.

## Technology

Use:

* React
* TypeScript
* Vite
* React Router
* CSS Variables
* CSS Modules
* Dexie / IndexedDB
* EmulatorJS
* mGBA
* vite-plugin-pwa
* Lucide React
* Vitest
* Testing Library
* Playwright

Do not introduce additional state management, UI frameworks or CSS frameworks unless there is a demonstrated architectural need.

## Design rules

Primary background:

#FAFAFA

Elevated background:

#FFFFFF

Recessed background:

#F2F2F2

Primary text:

#171717

Secondary text:

#4D4D4D

Muted text:

#8F8F8F

Interactive accent:

#0072F5

Input focus:

#005FCC

Use Geist Sans for interface text.

Use Geist Mono only for technical information where monospacing improves comprehension.

Allowed font weights:

400
500
600

Never use 700 or higher.

Default component radius:

6px

Card radius:

12px

Pill radius:

9999px

Spacing must use multiples of 4px.

Primary spacing values:

4
8
12
16
24
32
40
48
64
96
128

Do not use normal CSS borders for cards or containers.

Use:

box-shadow: 0 0 0 1px rgba(0,0,0,.08);

Use the focus ring:

box-shadow:
0 0 0 2px #fff,
0 0 0 4px #0072F5;

Color is functional, not decorative.

Do not use gradients.

Do not use glassmorphism.

Do not use neon visual effects.

Do not use large colored backgrounds.

Do not use excessive shadows.

Do not use exaggerated animations.

Do not scale buttons on hover.

Hover feedback should primarily use background and text-color changes.

## Architecture rules

UI components must not access IndexedDB directly.

Use repositories in:

src/storage/

UI components must not directly configure EmulatorJS.

Use:

src/emulator/EmulatorJSAdapter.ts

All emulator integration must be accessed through:

EmulatorManager

Game storage and emulator execution must remain separate.

Do not put large Blob objects in React state.

Do not store ROMs in localStorage.

ROMs, saves, save states and screenshots belong in IndexedDB.

Use localStorage only when appropriate for very small non-critical UI preferences.

## Emulator rules

Do not write a Game Boy Advance emulator.

Do not attempt to emulate ARM instructions.

Do not create an alternative GBA rendering engine.

Use EmulatorJS + mGBA.

Self-host the EmulatorJS runtime.

Do not rely on a third-party runtime CDN in production.

ROM URLs created with URL.createObjectURL() must always be revoked when the emulator instance is destroyed.

Only one emulator instance may exist at a time.

Clean up:

* event listeners
* Blob URLs
* timers
* animation frames
* wake locks
* gamepad polling loops

when leaving the Play page.

## Storage rules

Use Dexie.

Never index ROM Blob data.

Never index screenshot Blob data.

Store metadata separately from binary payloads when useful.

Use SHA-256 or equivalent stable ROM hashing to identify duplicate imports.

Never use the original filename alone as game identity.

Database upgrades must use versioned Dexie migrations.

Never destructively reset the database to solve migration problems.

## Save rules

Normal game save data and save states are separate concepts.

Normal save:

battery-backed / cartridge save data.

Save state:

snapshot of emulator state.

Both must be tied to the game ID.

Save callbacks from EmulatorJS must be bridged through:

src/emulator/saveBridge.ts

Autosaves must not write continuously every frame.

Writes should be debounced or triggered by save events.

## ROM privacy

ROMs imported through the application must remain on the user's device.

Do not implement ROM uploading.

Do not implement remote ROM analytics.

Do not transmit ROM hashes unless a future explicitly documented feature requires it.

Do not commit ROM files unless the user confirms they control the distribution
rights and the file is explicitly listed in the rights-cleared catalog approval
manifest with its exact path and SHA-256 checksum. Personal or unapproved ROMs
must never be committed or included in a production build.

## Error handling

Every asynchronous storage and emulator operation must have error handling.

Errors shown to users must be understandable.

Do not display raw stack traces in production UI.

Log developer details through the development logger.

## Accessibility

Interactive elements must be keyboard reachable.

Icon-only buttons require accessible labels.

Dialogs must trap focus.

Touch targets should be at least approximately 44px.

Do not remove visible focus indicators.

Respect prefers-reduced-motion.

## Responsive behavior

The application must work at:

320px
360px
375px
390px
430px
480px
600px
768px
1024px
1200px
1400px+

The emulator screen must never overflow the viewport.

Mobile controls must account for safe-area insets.

Use:

env(safe-area-inset-top)
env(safe-area-inset-right)
env(safe-area-inset-bottom)
env(safe-area-inset-left)

## Testing rules

After a significant implementation step run:

npm run typecheck
npm run lint
npm run test
npm run build

Before considering a phase complete run:

npm run test:e2e

Do not suppress TypeScript errors with `any` unless interfacing with an untyped third-party API and the reason is documented.

Do not mark a phase complete while tests fail.

## Working methodology

Implement one phase at a time.

Before modifying files:

1. inspect existing implementation
2. explain intended changes briefly
3. modify only relevant files
4. run verification
5. fix errors
6. summarize what changed

Do not rebuild working systems unnecessarily.

Prefer small reusable modules.

Avoid files larger than approximately 400 lines when reasonable.

Avoid React components larger than approximately 250 lines when they can be decomposed meaningfully.

## Completion definition

A feature is complete only when:

* implemented
* typed
* responsive
* accessible
* error handled
* tested
* documented where architecturally significant
* production build succeeds
