import Link from 'next/link'
import {getProducts} from '@/lib/server-catalog'
import ProductCard from '@/components/ProductCard'

const brandStyle:Record<string,{bg:string;fg:string}>={samsung:{bg:'#e9f2ff',fg:'#1428a0'},apple:{bg:'#f1f1f3',fg:'#111827'},vivo:{bg:'#e8fff4',fg:'#0b8f62'},oppo:{bg:'#eafbea',fg:'#178b43'},xiaomi:{bg:'#fff1e5',fg:'#d85b14'},realme:{bg:'#fff4d8',fg:'#b56a00'},infinix:{bg:'#eaf6ff',fg:'#0879b7'},huawei:{bg:'#ffecef',fg:'#b51f43'},tecno:{bg:'#eaf7ff',fg:'#0877a8'},itel:{bg:'#eff0ff',fg:'#4a4fb4'},nubia:{bg:'#ffecef',fg:'#9b1634'}}
const brandLogo:Record<string,{url:string;color:string;label:string}>={samsung:{url:'https://cdn.simpleicons.org/samsung/1428A0',color:'#1428a0',label:'Samsung'},apple:{url:'https://cdn.simpleicons.org/apple/111111',color:'#111',label:'Apple'},vivo:{url:'https://cdn.simpleicons.org/vivo/415FFF',color:'#415fff',label:'vivo'},oppo:{url:'https://cdn.simpleicons.org/oppo/006B33',color:'#006b33',label:'OPPO'},xiaomi:{url:'https://cdn.simpleicons.org/xiaomi/FF6900',color:'#ff6900',label:'Xiaomi'},infinix:{url:'https://cdn.simpleicons.org/infinix/0879B7',color:'#0879b7',label:'Infinix'},huawei:{url:'https://cdn.simpleicons.org/huawei/E81F28',color:'#e81f28',label:'Huawei'},realme:{url:'https://cdn.simpleicons.org/realme/686C74',color:'#686c74',label:'realme'},tecno:{url:'https://cdn.simpleicons.org/tecno/1B75BB',color:'#1b75bb',label:'TECNO'},itel:{url:'https://cdn.simpleicons.org/itel/FF0000',color:'#f00',label:'itel'},nubia:{url:'https://cdn.simpleicons.org/nubia/111111',color:'#111',label:'nubia'}}
function BrandMark({name,slug}:{name:string;slug:string}){const s=brandStyle[slug]||{bg:'#eef2f7',fg:'#172033'};const logo=brandLogo[slug];return <div className="brand-mark" style={{background:s.bg,color:s.fg}}>{logo?<img src={logo.url} alt={logo.label+' logo'} loading="eager" onError={(e)=>{e.currentTarget.style.display='none';e.currentTarget.nextElementSibling?.removeAttribute('hidden')}}/><span className="brand-wordmark" hidden style={{color:logo.color}}>{logo.label}</span>:<span>{name.slice(0,1).toUpperCase()}</span>}</div>}
export default async function Products({searchParams}:{searchParams:Promise<{brand?:string}>}){
 const products=await getProducts()
 const params=await searchParams
 const brandSlug=params?.brand?.toLowerCase()
 const brands=Array.from(new Map(products.map((p:any)=>[p.brand?.slug,{name:p.brand?.name,slug:p.brand?.slug}])).values()).sort((a:any,b:any)=>a.name.localeCompare(b.name))
 const filtered=brandSlug?products.filter((p:any)=>p.brand?.slug===brandSlug):products
 const activeBrand=brands.find((b:any)=>b.slug===brandSlug)
 return <main className="catalog-page">
  <section className="catalog-hero"><div className="container">
   <div className="catalog-eyebrow"><span className="eyebrow-dot"/> B-TECH PHONE · 2026 CATALOG</div>
   <div className="catalog-title-row"><div><h1>{activeBrand?activeBrand.name:'Smartphone terbaik, satu tempat.'}</h1><p>{activeBrand?'Koleksi '+activeBrand.name+' yang sedang tersedia di B-Tech Phone.':'Pilih brand favoritmu. Jelajahi seluruh lini produk dalam satu tap.'}</p></div><div className="catalog-count"><strong>{filtered.length}</strong><span>produk</span></div></div>
  </div></section>
  <section className="container brand-section"><div className="section-head"><div><span className="section-kicker">PILIH BRAND</span><h2>Brand favoritmu</h2></div>{brandSlug&&<Link className="clear-filter" href="/produk">Lihat semua brand ×</Link>}</div>
   <div className="brand-grid">
    <Link href="/produk" className={'brand-card '+(!brandSlug?'active':'')}><div className="brand-icon-all">✦</div><div><strong>Semua Brand</strong><span>{products.length} produk</span></div><span className="brand-arrow">→</span></Link>
    {brands.map((b:any)=><Link key={b.slug} href={'/produk?brand='+b.slug} className={'brand-card '+(brandSlug===b.slug?'active':'')}><BrandMark name={b.name} slug={b.slug}/><div><strong>{b.name}</strong><span>{products.filter((p:any)=>p.brand?.slug===b.slug).length} produk</span></div><span className="brand-arrow">→</span></Link>)}
   </div>
  </section>
  <section className="container products-section"><div className="section-head"><div><span className="section-kicker">{activeBrand?'KOLEKSI '+activeBrand.name.toUpperCase():'ALL PRODUCTS'}</span><h2>{activeBrand?'Produk '+activeBrand.name:'Pilihan produk'}</h2></div><span className="result-count">{filtered.length} item</span></div>
   {filtered.length?<div className="grid-products">{filtered.map((p:any)=><ProductCard key={p.id} p={p}/>)}</div>:<div className="empty-catalog"><strong>Belum ada produk aktif</strong><p>Brand ini belum memiliki produk yang tersedia saat ini.</p></div>}
  </section>
 </main>
}