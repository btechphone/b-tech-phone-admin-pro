import Link from 'next/link'
import {getProducts} from '@/lib/server-catalog'
import ProductCard from '@/components/ProductCard'

export default async function Home(){
 const products=await getProducts()
 const featured=products.slice(0,8)
 return <main className="home-page">
  <section className="home-hero">
   <div className="container">
    <div className="catalog-eyebrow"><span className="eyebrow-dot"/> B-TECH PHONE · 2026</div>
    <div className="home-hero-grid">
     <div>
      <h1>Belanja smartphone dengan <span>alur yang jelas.</span></h1>
      <p>Temukan produk, pilih varian, checkout, transfer, upload bukti pembayaran, lalu tunggu verifikasi admin.</p>
      <div className="home-actions"><Link className="btn primary" href="/produk">Jelajahi Produk ↗</Link><Link className="btn ghost" href="/keranjang">Lihat Keranjang</Link></div>
     </div>
     <div className="home-hero-card"><span>CATALOG</span><strong>{products.length}</strong><small>produk aktif</small><Link href="/produk">Lihat seluruh katalog →</Link></div>
    </div>
   </div>
  </section>
  <section className="container home-products">
   <div className="section-head"><div><span className="section-kicker">PILIHAN TERSEDIA</span><h2>Produk pilihan</h2></div><Link className="clear-filter" href="/produk">Semua produk →</Link></div>
   <div className="grid-products">{featured.map((p:any)=><ProductCard key={p.id} p={p}/>)}</div>
  </section>
 </main>
}
