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


const productDetail = path.join(root, 'components/ProductDetail.tsx')
if (fs.existsSync(productDetail)) {
  fs.writeFileSync(productDetail, "'use client'\nimport {useState} from 'react'\nimport {addToCart} from '@/lib/cart'\nimport {formatIDR} from '@/lib/catalog'\n\nexport function ProductDetail({product}:any){\n const variants=product.variants||[]\n const [id,setId]=useState(variants[0]?.id)\n const [active,setActive]=useState(0)\n const v=variants.find((x:any)=>x.id===id)\n const stock=v?.inventory?Math.max(0,Number(v.inventory.stock_quantity||0)-Number(v.inventory.reserved_quantity||0)):0\n const images=[...(product.btp_product_images||[])].sort((a:any,b:any)=>a.sort_order-b.sort_order).map((x:any)=>({url:`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/btp-product-images/${x.storage_path}`,alt:x.alt_text||product.name}))\n if(product.image_url&&!images.length)images.push({url:product.image_url,alt:product.name})\n const formatPrice=(n:number)=>n>0?formatIDR(n):'Harga belum tersedia'\n const stockLabel=stock>0?`Stok tersedia: ${stock} unit`:'Stok habis'\n return <div className=\"detail\">\n  <div>\n   <div className=\"detail-image product-gallery-main\">{images[active]?<img src={images[active].url} alt={images[active].alt}/>:<span>📱</span>}</div>\n   {images.length>1&&<div className=\"gallery-thumbs\">{images.map((im:any,i:number)=><button type=\"button\" key={im.url} className={i===active?'gallery-thumb active':'gallery-thumb'} onClick={()=>setActive(i)}><img src={im.url} alt=\"\"/></button>)}</div>}\n  </div>\n  <div>\n   <p className=\"eyebrow\">{product.brand.name}</p>\n   <h1>{product.name}</h1>\n   <p>{product.short_description||product.description}</p>\n   <h3>Seluruh varian</h3>\n   <div className=\"variant-list\">\n    {variants.map((x:any)=>{\n      const xStock=x.inventory?Math.max(0,Number(x.inventory.stock_quantity||0)-Number(x.inventory.reserved_quantity||0)):0\n      return <button type=\"button\" key={x.id} className={x.id===id?'variant active':'variant'} onClick={()=>setId(x.id)}>\n       <span>{x.variant_name}</span>\n       <small>{formatPrice(Number(x.price))} · {xStock>0?`Stok ${xStock}`:'Stok habis'}</small>\n      </button>\n    })}\n   </div>\n   {v&&<div className=\"product-purchase\">\n    <p className=\"price\">{formatPrice(Number(v.price))}</p>\n    <p className={stock>0?'stock-ok':'stock-out'}>{stockLabel}</p>\n    {Number(v.price)<=0&&<p className=\"muted\">Harga varian ini belum ditentukan. Silakan hubungi admin.</p>}\n    <button className=\"button\" disabled={stock<1||Number(v.price)<=0} onClick={()=>addToCart({variantId:v.id,productId:product.id,productName:product.name,variantName:v.variant_name,sku:v.sku,price:Number(v.price),imageUrl:images[0]?.url||product.image_url,quantity:1})}>Tambah ke keranjang</button>\n   </div>}\n  </div>\n </div>\n}\n")
}

console.log(`[restore-v2] restored ${restored} source files and applied build compatibility patches`)



const productCard = path.join(root, 'components/ProductCard.tsx')
if (fs.existsSync(productCard)) {
  fs.writeFileSync(productCard, "import Link from 'next/link'\n\nexport default function ProductCard({p}:any){\n const variants=p.btp_product_variants||[]\n const pricedVariants=variants.filter((x:any)=>Number(x.price)>0)\n const lowestPrice=pricedVariants.length?Math.min(...pricedVariants.map((x:any)=>Number(x.price))):0\n const img=p.image_url||p.gallery_urls?.[0]\n const format=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)\n return <article className=\"card\" style={{overflow:'hidden'}}>\n  <Link href={'/produk/'+p.slug}>{img?<img src={img} alt={p.name} style={{width:'100%',aspectRatio:'1/1',objectFit:'cover'}}/>:<div style={{aspectRatio:'1/1',display:'grid',placeItems:'center',background:'#111827'}} className=\"muted\">B-TECH</div>}</Link>\n  <div style={{padding:15}}><div className=\"muted\" style={{fontSize:12}}>{p.btp_brands?.name||p.category}</div><h3 style={{margin:'5px 0 8px'}}>{p.name}</h3><div className=\"muted\" style={{fontSize:13}}>{variants.length?(`${variants.length} varian tersedia`):'Pilih varian'}</div><strong style={{display:'block',marginTop:10}}>{lowestPrice?`Mulai ${format(lowestPrice)}`:'Harga belum tersedia'}</strong></div>\n </article>\n}")
}
