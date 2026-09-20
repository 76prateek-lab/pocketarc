import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import { extname, join, relative, sep } from 'node:path'
import process from 'node:process'

const prohibitedExtensions = new Set(['.gba', '.gb', '.gbc', '.sav', '.state'])
const ignoredDirectories = new Set(['.git', 'dist', 'node_modules', 'playwright-report', 'test-results'])
const root = process.cwd()
const catalogPath = join(root, 'public', 'catalog', 'games.json')
const approvalPath = join(root, 'scripts', 'approved-catalog-roms.json')

async function findProhibitedFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const matches = []

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue

    const absolutePath = join(directory, entry.name)
    const projectPath = relative(root, absolutePath)

    if (entry.isDirectory()) {
      if (projectPath === 'private-roms') continue
      matches.push(...await findProhibitedFiles(absolutePath))
    } else if (prohibitedExtensions.has(extname(entry.name).toLowerCase())) {
      matches.push(projectPath)
    }
  }

  return matches
}

function findTrackedProhibitedFiles() {
  try {
    const output = execFileSync('git', ['ls-files', '-z'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return output
      .split('\0')
      .filter(Boolean)
      .filter((file) => prohibitedExtensions.has(extname(file).toLowerCase()))
  } catch {
    return []
  }
}

const prohibitedFiles = [...new Set([
  ...await findProhibitedFiles(root),
  ...findTrackedProhibitedFiles(),
])]

async function approvedCatalogFiles() {
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
  const approvals = JSON.parse(await readFile(approvalPath, 'utf8'))
  if (!Array.isArray(catalog) || !Array.isArray(approvals)) throw new Error('Catalog and approval manifests must be arrays.')
  const approved = new Map(approvals.map((entry) => [entry.romPath, entry.checksum]))
  const allowed = new Set()
  for (const entry of catalog) {
    if (!entry || typeof entry !== 'object' || !/^\/catalog\/roms\/[a-zA-Z0-9._-]+\.gba$/.test(entry.romPath ?? '')) throw new Error('Every catalog ROM path must be a safe file under /catalog/roms/.')
    const projectPath = `public${entry.romPath}`
    if (approved.get(entry.romPath) !== entry.checksum) throw new Error(`Catalog ROM is not rights-approved: ${projectPath}`)
    const file = await readFile(join(root, projectPath))
    const info = await stat(join(root, projectPath))
    const checksum = createHash('sha256').update(file).digest('hex')
    if (checksum !== entry.checksum || info.size !== entry.fileSize) throw new Error(`Approved catalog ROM does not match its manifest: ${projectPath}`)
    allowed.add(projectPath)
  }
  if (allowed.size !== approvals.length) throw new Error('Every rights-approved ROM must have matching catalog metadata.')
  return allowed
}

const allowed = await approvedCatalogFiles()
const unapprovedFiles = prohibitedFiles.filter((file) => !allowed.has(file.split(sep).join('/'))).sort()

if (unapprovedFiles.length > 0) {
  console.error('ROM, save, or save-state files were found in prohibited locations:')
  for (const file of unapprovedFiles) console.error(`- ${file.split(sep).join('/')}`)
  process.exit(1)
}

console.log(`ROM verification passed: no unauthorized game or save files found (${allowed.size} rights-approved catalog ROMs).`)
