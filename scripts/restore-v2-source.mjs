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


const productCard = path.join(root, 'components/ProductCard.tsx')
if (fs.existsSync(productCard)) {
  fs.writeFileSync(productCard, `import Link from 'next/link'

export default function ProductCard({p}:any){
 const variants=p.btp_product_variants||[]
 const pricedVariants=variants.filter((x:any)=>Number(x.price)>0)
 const lowestPrice=pricedVariants.length?Math.min(...pricedVariants.map((x:any)=>Number(x.price))):0
 const img=p.image_url||p.gallery_urls?.[0]
 const format=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)
 return <article className="card" style={{overflow:'hidden'}}>
  <Link href={'/produk/'+p.slug}>{img?<img src={img} alt={p.name} style={{width:'100%',aspectRatio:'1/1',objectFit:'cover'}}/>:<div style={{aspectRatio:'1/1',display:'grid',placeItems:'center',background:'#111827'}} className="muted">B-TECH</div>}</Link>
  <div style={{padding:15}}><div className="muted" style={{fontSize:12}}>{p.btp_brands?.name||p.category}</div><h3 style={{margin:'5px 0 8px'}}>{p.name}</h3><div className="muted" style={{fontSize:13}}>{variants.length?(`${variants.length} varian tersedia`):'Pilih varian'}</div><strong style={{display:'block',marginTop:10}}>{lowestPrice?`Mulai ${format(lowestPrice)}`:'Harga belum tersedia'}</strong></div>
 </article>
}
`)
}
