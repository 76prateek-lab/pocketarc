# ROM Policy

PocketArc accepts local ROM imports and can expose a checksum-locked curated
catalog. User imports remain on their device. Public catalog files are included
only after the project owner explicitly confirms redistribution permission for
the exact binaries.

Private development ROMs belong in `private-roms/` and must never be committed.
Only explicitly approved redistributable ROMs may be added to the public
catalog. Adding one requires all of the following:

1. The project owner confirms public redistribution permission.
2. Metadata is added to `public/catalog/games.json` with the exact SHA-256 and
   byte size.
3. The same ROM path and checksum are explicitly added to
   `scripts/approved-catalog-roms.json`.
4. `npm run verify:roms` confirms the public file matches both manifests.

The current eight catalog binaries were added after the project owner confirmed
permission to redistribute those exact files. Their path, byte size, and SHA-256
are locked by both manifests and verified on every production build. Files are
never copied from `private-roms/` automatically.

Catalog metadata is synchronized into IndexedDB without downloading ROM data.
A user must choose **Install for Offline** before PocketArc fetches a catalog
ROM. The response size and SHA-256 must match before its Blob is stored.
