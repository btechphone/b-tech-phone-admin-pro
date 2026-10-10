import Link from 'next/link';
import { getProducts } from '@/lib/server-catalog';
import ProductCard from '@/components/ProductCard';

const brands = [
  { name: 'Samsung', slug: 'samsung', mark: 'S', tone: 'brand-samsung' },
  { name: 'Apple', slug: 'apple', mark: '●', tone: 'brand-apple' },
  { name: 'Vivo', slug: 'vivo', mark: 'vivo', tone: 'brand-vivo' },
  { name: 'OPPO', slug: 'oppo', mark: 'OPPO', tone: 'brand-oppo' },
  { name: 'Xiaomi', slug: 'xiaomi', mark: 'mi', tone: 'brand-xiaomi' },
  { name: 'Infinix', slug: 'infinix', mark: 'IN', tone: 'brand-infinix' },
  { name: 'realme', slug: 'realme', mark: 'realme', tone: 'brand-realme' },
  { name: 'TECNO', slug: 'tecno', mark: 'TECNO', tone: 'brand-tecno' },
  { name: 'Huawei', slug: 'huawei', mark: 'HUAWEI', tone: 'brand-huawei' },
  { name: 'itel', slug: 'itel', mark: 'itel', tone: 'brand-itel' },
  { name: 'nubia', slug: 'nubia', mark: 'nubia', tone: 'brand-nubia' },
];

export default async function Home() {
  const products = await getProducts();
  return (
    <main className="home-store">
      <div className="home-topline"><div className="container home-topline-inner"><span>SMARTPHONE ORIGINAL • PILIHAN TERKINI</span><span>Konsultasi sebelum membeli</span></div></div>
      <header className="container home-header">
        <Link href="/" className="home-wordmark"><span className="home-logo">B</span><span>B-TECH <b>PHONE</b><small>SMARTER CHOICE. BETTER DEVICE.</small></span></Link>
        <nav className="home-nav"><Link href="/produk">Semua Produk</Link><a href="#brand">Brand</a><a href="#unggulan">Pilihan Kami</a></nav>
        <div className="home-actions"><Link href="/auth/login" aria-label="Masuk">Masuk</Link><Link className="home-cart" href="/produk">Jelajahi Produk <span>↗</span></Link></div>
      </header>
      <section className="container home-hero">
        <div className="home-hero-copy"><span className="home-pill"><i /> YOUR NEXT DEVICE STARTS HERE</span><h1>Temukan perangkat<br />yang <em>pas untukmu.</em></h1><p>Bandingkan pilihan smartphone dari berbagai brand, cek varian dan harga, lalu lanjutkan pembelian dengan mudah.</p><div className="home-hero-actions"><Link className="home-primary" href="/produk">Belanja Sekarang <span>→</span></Link><a className="home-secondary" href="https://wa.me/628565033160">Tanya Admin WhatsApp</a></div><div className="home-trust"><span>✓ Informasi varian jelas</span><span>✓ Bantuan admin</span><span>✓ Checkout praktis</span></div></div>
        <div className="home-hero-art" aria-label="Ilustrasi smartphone"><div className="home-art-glow" /><div className="home-art-label label-top">NEW ARRIVALS <span>↗</span></div><div className="home-phone phone-back"><div className="phone-camera camera-one" /><div className="phone-camera camera-two" /><div className="phone-camera camera-three" /><div className="phone-shine" /></div><div className="home-phone phone-front"><div className="phone-notch" /><div className="phone-screen-orb orb-one" /><div className="phone-screen-orb orb-two" /><div className="phone-screen-text">MAKE IT<br /><b>YOURS.</b></div><div className="phone-screen-time">09:41</div></div><div className="home-art-label label-bottom"><b>TECH THAT MOVES YOU</b><span>01 / 04</span></div></div>
      </section>
      <section className="container home-benefits"><div><span className="benefit-icon">◇</span><span><b>Pilihan multi-brand</b><small>Temukan perangkat favoritmu</small></span></div><div><span className="benefit-icon">↗</span><span><b>Harga transparan</b><small>Harga tiap varian tersedia</small></span></div><div><span className="benefit-icon">◎</span><span><b>Dibantu admin</b><small>Tanya sebelum checkout</small></span></div></section>
      <section className="container home-brand-section" id="brand"><div className="home-section-heading"><div><span className="home-kicker">SHOP BY BRAND</span><h2>Brand favorit, <em>satu tempat.</em></h2></div><Link href="/produk">Lihat semua produk <span>↗</span></Link></div><div className="home-brand-grid">{brands.map((brand) => <Link key={brand.name} href={`/produk?brand=${brand.slug}`} className="home-brand-card"><span className={`home-brand-mark ${brand.tone}`}>{brand.mark}</span><span className="home-brand-name">{brand.name}</span><span className="home-brand-arrow">↗</span></Link>)}</div></section>
      <section className="home-featured" id="unggulan"><div className="container"><div className="home-section-heading"><div><span className="home-kicker">CURATED FOR YOU</span><h2>Perangkat pilihan <em>minggu ini.</em></h2><p>Mulai dari kebutuhan harian hingga performa yang lebih serius.</p></div><Link href="/produk">Jelajahi katalog <span>↗</span></Link></div><div className="grid-products">{products.slice(0, 8).map((p: any) => <ProductCard key={p.id} p={p} />)}</div></div></section>
      <section className="container home-contact"><div><span className="home-kicker">NEED A HAND?</span><h2>Masih bingung memilih?</h2><p>Hubungi admin kami untuk bertanya tentang produk, varian, dan proses pemesanan.</p></div><a href="https://wa.me/628565033160" className="home-primary">Chat SEPRI via WhatsApp <span>↗</span></a></section>
      <footer className="home-footer"><div className="container"><Link href="/" className="home-wordmark"><span className="home-logo">B</span><span>B-TECH <b>PHONE</b><small>SMARTER CHOICE. BETTER DEVICE.</small></span></Link><span>Temukan perangkat yang tepat untuk kebutuhanmu.</span><Link href="/produk">Lihat katalog ↗</Link></div></footer>
    </main>
  );
}
