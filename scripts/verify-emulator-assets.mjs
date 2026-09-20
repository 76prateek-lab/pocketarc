import { access, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const requiredAssets = [
  'public/emulatorjs/frame.html',
  'public/emulatorjs/emulator-overrides.css',
  'public/emulatorjs/data/loader.js',
  'public/emulatorjs/data/emulator.css',
  'public/emulatorjs/data/version.json',
  'public/emulatorjs/data/src/emulator.js',
  'public/emulatorjs/data/src/GameManager.js',
  'public/emulatorjs/data/src/gamepad.js',
  'public/emulatorjs/data/src/storage.js',
  'public/emulatorjs/data/cores/mgba-wasm.data',
  'public/emulatorjs/data/cores/mgba-legacy-wasm.data',
  'public/emulatorjs/data/cores/reports/mgba.json',
  'public/emulatorjs/licenses/EmulatorJS-GPL-3.0.txt',
  'public/emulatorjs/licenses/mGBA-MPL-2.0.txt',
]

const missing = []
for (const asset of requiredAssets) {
  try {
    await access(resolve(asset))
    if ((await stat(resolve(asset))).size === 0) missing.push(`${asset} (empty)`)
  } catch {
    missing.push(asset)
  }
}

if (missing.length) {
  console.error(`Missing required EmulatorJS assets:\n${missing.map((asset) => `- ${asset}`).join('\n')}`)
  process.exit(1)
}

console.log(`EmulatorJS verification passed: ${requiredAssets.length} required assets found.`)
