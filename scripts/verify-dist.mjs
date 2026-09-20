import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const dist = join(root, 'dist')
const forbiddenExtensions = new Set(['.gba', '.gb', '.gbc', '.sav', '.state'])
const requiredAssets = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'icons/apple-touch-icon.png',
  'icons/pwa-192x192.png',
  'icons/pwa-512x512.png',
  'icons/maskable-512x512.png',
  'emulatorjs/frame.html',
  'emulatorjs/data/loader.js',
  'emulatorjs/data/emulator.css',
  'emulatorjs/data/cores/mgba-wasm.data',
  'emulatorjs/data/cores/mgba-legacy-wasm.data',
  'emulatorjs/data/cores/reports/mgba.json',
]

async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path))
    else files.push(path)
  }
  return files
}

const missing = []
for (const asset of requiredAssets) {
  try {
    if ((await stat(join(dist, asset))).size === 0) missing.push(`${asset} (empty)`)
  } catch {
    missing.push(asset)
  }
}
if (missing.length > 0) throw new Error(`Production output is missing required assets:\n${missing.map((asset) => `- ${asset}`).join('\n')}`)

const files = await walk(dist)
const binaryFiles = files
  .filter((file) => forbiddenExtensions.has(extname(file).toLowerCase()))
  .map((file) => relative(dist, file))

const approvals = JSON.parse(await readFile(join(root, 'scripts', 'approved-catalog-roms.json'), 'utf8'))
const approved = new Map(approvals.map((entry) => [entry.romPath.replace(/^\//, ''), entry.checksum]))
for (const file of binaryFiles) {
  const expected = approved.get(file)
  if (!expected) throw new Error(`Production output contains unapproved game or save data: ${file}`)
  const checksum = createHash('sha256').update(await readFile(join(dist, file))).digest('hex')
  if (checksum !== expected) throw new Error(`Production catalog ROM checksum does not match its approval: ${file}`)
}
if (binaryFiles.length !== approved.size) throw new Error('The production catalog does not match the rights-approved ROM manifest.')

const manifest = JSON.parse(await readFile(join(dist, 'manifest.webmanifest'), 'utf8'))
if (manifest.scope !== '/' || manifest.start_url !== '/app') {
  throw new Error('PWA manifest must use root-subdomain-compatible scope and start URL values.')
}

const serviceWorker = await readFile(join(dist, 'sw.js'), 'utf8')
if (/\.(?:gba|gb|gbc|sav|state)(?:["'?,]|$)|\/catalog\/roms\//i.test(serviceWorker)) {
  throw new Error('The production service worker attempts to precache game or save data.')
}

const catalog = JSON.parse(await readFile(join(dist, 'catalog', 'games.json'), 'utf8'))
if (!Array.isArray(catalog) || catalog.length !== approved.size) throw new Error('The production catalog metadata does not match the approved ROM set.')

console.log(`Production output verification passed: ${files.length} files, required PWA and EmulatorJS/mGBA assets present, ${approved.size} rights-approved ROMs verified, no unauthorized save artifacts.`)
