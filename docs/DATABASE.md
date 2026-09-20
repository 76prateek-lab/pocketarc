# Database

PocketArc uses versioned Dexie migrations for `PocketGBADB`. Version 2 adds a
`covers` table keyed by cover ID with a unique `gameId` index. Image Blob data
is never indexed and the game record stores only `coverId`, keeping large
payloads out of library metadata queries.

Version 4 aligns the public record model with semantic `coverId`, `createdAt`
on normal saves, and string save-state slots (`auto`, `quick`, `1`, `2`, `3`).
It also removes secondary indexes that are not used by repository queries.

Deleting a game runs one transaction across games, ROMs, saves, save states,
screenshots, sessions, and custom covers. App and service-worker updates do not
reset or clear this database.

PocketArc stores durable local data in the `PocketGBADB` IndexedDB database via
Dexie. React components never query Dexie directly; they subscribe through
hooks backed by repositories and application services.

## Current tables and query indexes

| Table | Purpose | Important indexes |
| --- | --- | --- |
| `games` | Library metadata | unique `romHash`, `addedAt` |
| `roms` | Original ROM binary and file metadata | unique `hash`; binary data is not indexed |
| `saves` | Battery-backed save data | unique `gameId`, `updatedAt` |
| `saveStates` | Emulator snapshots | `gameId`, unique compound game/slot index |
| `screenshots` | Manual and save-state images | `gameId`; binary data is not indexed |
| `cheats` | Per-game cheat definitions | `gameId`; stored separately from settings and saves |
| `settings` | Necessary application preferences | `key` |
| `sessions` | Playtime sessions | `gameId` |
| `covers` | User-provided local cover art | unique `gameId`; binary data is not indexed |

Schema versions are registered in `src/storage/migrations.ts`. Future upgrades
must add a new Dexie version and a non-destructive migration; resetting the
database is not an acceptable migration strategy.

## ROM imports

The import service validates `.gba` files and the 32 MB platform limit before
reading them. It hashes bytes with SHA-256, uses the unique ROM hash to reject
duplicates, then stores the ROM and game metadata in one transaction. Import UI
state contains filenames and progress only—not ROM blobs.

Deleting a game uses a single transaction to remove its ROM, saves, save states,
screenshots, and sessions. The UI requires explicit confirmation and explains
the complete deletion scope.

## Saves

Battery-backed normal saves live in `saves` and have one current record per
game. Empty buffers are rejected so emulator startup cannot overwrite a known
good save. `.sav` import replaces that record only after UI confirmation, while
export creates a local object URL that is revoked after the download begins.

Save states live in `saveStates` and use the `[gameId+slot]` compound index.
Slot overwrite retains the record identity and creation date while updating its
binary data and timestamp. Screenshots are separate, unindexed blobs; replacing
or deleting a state removes its superseded screenshot in the same transaction.
The slot convention is `auto`, numbered slots `1`–`3`, and `quick`.

Binary payload fields use `StoredBinary` (`Blob | ArrayBuffer`) rather than a
Blob-only type. New writes use ArrayBuffer because Safari/WebKit can reject Blob
values in IndexedDB; repository boundaries convert back to Blob when a browser
API or download needs one.

Input remapping, touch opacity, and the optional haptics preference are stored
together under the small `inputSettings` key. No input setting contains game or
ROM data.
# Storage backups

PocketArc backups are versioned ZIP archives produced and restored by `backupService`. Save-only and full-metadata exports omit ROM binaries. A ROM-inclusive personal backup is produced only after the user explicitly enables that option. Restore validates and stages the complete archive before opening a single Dexie transaction, so malformed archives cannot clear or partially replace the existing database.

`manifest.json` records `backupFormatVersion`, application version, creation time, backup type, ROM-inclusion status, and game identifiers. Binary records are stored separately from their JSON indexes under `saves/`, `states/`, `screenshots/`, `covers/`, and—only for opted-in personal backups—`roms/`.
