# Architecture

PocketArc follows a layered architecture: UI, application services,
repositories and emulator adapters, then IndexedDB, EmulatorJS, and browser
platform APIs. Detailed decisions will be documented as their phases are built.

## Application shell

`AppLayout` owns the shared header, desktop navigation, mobile navigation, and
the constrained content region. Product routes render through its React Router
outlet. The design-system preview remains a development-only route outside the
production shell.

## Data and runtime boundaries

Library and game-detail screens consume repository-backed `Game` records.
Components never query IndexedDB directly, and binary ROM/save payloads are
kept outside React state. Runtime integration is isolated behind
`EmulatorManager` and `EmulatorJSAdapter`; browser-level fullscreen, wake-lock,
playtime, storage, and input behavior lives in application services.

Play sessions are append-only records with accumulated active duration. Each
duration commit updates the associated game's library metadata in the same
Dexie transaction, so Continue Playing and playtime stay consistent after a
route change, reload, or orderly exit.

## Settings

`settingsService` is the validation and migration boundary for preferences.
Global settings are stored as one versioned `appSettings` record; legacy input
settings are merged on first read. Missing, malformed, and out-of-range values
are repaired to defaults and persisted automatically.

Per-game records use `gameSettings:<gameId>` and contain only sparse overrides
for display, controls, volume, mute, and fast-forward preferences. Runtime
resolution layers those values over global settings without copying the whole
global object.
