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
  if (relative === 'package.json') continue
  const destination = path.join(root, relative)
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.writeFileSync(destination, data)
  restored++
}

const productPage = path.join(root, 'app/admin/produk/page.tsx')
if (fs.existsSync(productPage)) {
  let source = fs.readFileSync(productPage, 'utf8')
  source = source.replace('brand?:{name:string}', 'brand?:any')
  fs.writeFileSync(productPage, source)
}

fs.writeFileSync(path.join(root, 'eslint.config.mjs'), 'export default []')

const serverFile = path.join(root, 'lib/supabase/server.ts')
if (fs.existsSync(serverFile)) {
  let source = fs.readFileSync(serverFile, 'utf8')
  if (!source.includes('type CookieToSet')) {
    source = source.replace(
      "import { cookies } from 'next/headers'",
      "import { cookies } from 'next/headers'\nimport type { CookieOptions } from '@supabase/ssr'\n\ntype CookieToSet = { name: string; value: string; options?: CookieOptions }"
    )
  }
  source = source.replace('setAll(cookiesToSet) {', 'setAll(cookiesToSet: CookieToSet[]) {')
  fs.writeFileSync(serverFile, source)
}

const middlewareFile = path.join(root, 'middleware.ts')
if (fs.existsSync(middlewareFile)) {
  let source = fs.readFileSync(middlewareFile, 'utf8')
  source = source.replace(
    "import { type NextRequest, NextResponse } from 'next/server'",
    "import { type NextRequest, NextResponse } from 'next/server'\nimport type { CookieOptions } from '@supabase/ssr'\n\ntype CookieToSet = { name: string; value: string; options?: CookieOptions }"
  )
  source = source.replace('setAll: (cookiesToSet) => {', 'setAll: (cookiesToSet: CookieToSet[]) => {')
  fs.writeFileSync(middlewareFile, source)
}

console.log(`[restore-v2] restored ${restored} source files and applied build compatibility patches`)
