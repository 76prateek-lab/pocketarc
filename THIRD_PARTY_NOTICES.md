# Third-party notices

## EmulatorJS 4.2.3

PocketArc vendors the browser runtime from
[`EmulatorJS/EmulatorJS`](https://github.com/EmulatorJS/EmulatorJS), licensed
under GPL-3.0. Vendored files are stored in `public/emulatorjs/data`. PocketArc
applies targeted source changes to disable EmulatorJS's remote core fallback
and connect its documented save-update callback to the 4.2.3 save event;
missing cores fail locally instead. Presentation overrides live in a separate
stylesheet. The distributed license text is available at
`public/emulatorjs/licenses/EmulatorJS-GPL-3.0.txt`.

## mGBA core 4.2.3

PocketArc vendors the EmulatorJS mGBA WebAssembly core. mGBA is copyright
Jeffrey Pfau and contributors and is distributed under MPL-2.0. See the
[`mgba-emu/mgba`](https://github.com/mgba-emu/mgba) project for source and full
license information.
The distributed license text is available at
`public/emulatorjs/licenses/mGBA-MPL-2.0.txt`.

No BIOS or commercial ROM data is distributed with PocketArc.
