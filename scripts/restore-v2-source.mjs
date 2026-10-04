import fs from 'node:fs'
import path from 'node:path'
import { unzipSync } from 'fflate'

const root = process.cwd()
const archive = path.join(root, 'btp-v2-source-payload.zip')

if (!fs.existsSync(archive)) {
  console.log('[restore-v2] archive not found; using repository files as-is')
  process.exit(0)
}

const files = unzipSync(fs.readFileSync(archive))
let restored = 0

for (const [name, data] of Object.entries(files)) {
  const normalized = name.replace(/\\/g, '/')
  if (!normalized.startsWith('b-tech-phone/')) continue

  const relative = normalized.slice('b-tech-phone/'.length)
  if (!relative || relative.endsWith('/')) continue

  const destination = path.join(root, relative)
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.writeFileSync(destination, data)
  restored++
}

console.log(`[restore-v2] restored ${restored} source files`)
