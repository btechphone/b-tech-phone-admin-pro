import Link from 'next/link';
import { getProducts } from '@/lib/server-catalog';
import ProductCard from '@/components/ProductCard';


type Segment = { id: string; title: string; subtitle: string; min: number; max: number; accent: string };
const segments: Segment[] = [
  { id: 'entry', title: 'Entry-Level', subtitle: 'Pilihan praktis untuk kebutuhan harian', min: 0, max: 3500000, accent: 'entry' },
  { id: 'mid', title: 'Mid-Range', subtitle: 'Seimbang untuk kerja, hiburan, dan kamera', min: 3500000, max: 5000000, accent: 'mid' },
  { id: 'high', title: 'High-End', subtitle: 'Performa dan fitur premium', min: 5000000, max: 10000000, accent: 'high' },
  { id: 'flagship', title: 'Flagship', subtitle: 'Teknologi unggulan dari lini teratas', min: 10000000, max: Number.POSITIVE_INFINITY, accent: 'flagship' },
];
function minPrice(product: any) {
  const variants = product.variants?.length ? product.variants : (product.btp_product_variants || []);
  const prices = variants.map((v: any) => Number(v.price)).filter((price: number) => Number.isFinite(price) && price > 0);
  return prices.length ? Math.min(...prices) : null;
}
function productsForSegment(products: any[], segment: Segment) {
  const matches = products.filter((product) => {
    const price = minPrice(product);
    return price !== null && price >= segment.min && price < segment.max;
  }).sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)));
  const selected: any[] = [];
  const seenBrands = new Set<string>();
  for (const product of matches) {
    const brand = product.btp_brands?.slug || product.brand?.slug || product.category || product.id;
    if (!seenBrands.has(brand)) {
      selected.push(product);
      seenBrands.add(brand);
    }
    if (selected.length >= 8) break;
  }
  if (selected.length < 8) {
    for (const product of matches) {
      if (!selected.some((item) => item.id === product.id)) selected.push(product);
      if (selected.length >= 8) break;
    }
  }
  return selected;
}

const brands = [
  { name: 'Samsung', slug: 'samsung', logo: 'https://cdn.simpleicons.org/samsung/1428A0', tone: 'brand-samsung' },
  { name: 'Apple', slug: 'apple', logo: 'https://cdn.simpleicons.org/apple/111111', tone: 'brand-apple' },
  { name: 'Vivo', slug: 'vivo', logo: 'https://cdn.simpleicons.org/vivo/415FFF', tone: 'brand-vivo' },
  { name: 'OPPO', slug: 'oppo', logo: 'https://cdn.simpleicons.org/oppo/006B33', tone: 'brand-oppo' },
  { name: 'Xiaomi', slug: 'xiaomi', logo: 'https://cdn.simpleicons.org/xiaomi/FF6900', tone: 'brand-xiaomi' },
  { name: 'Infinix', slug: 'infinix', logo: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Infinix_logo.svg', tone: 'brand-infinix' },
  { name: 'realme', slug: 'realme', logo: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Realme_logo_SVG.svg', tone: 'brand-realme' },
  { name: 'TECNO', slug: 'tecno', logo: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tecno_Mobile_logo.svg', tone: 'brand-tecno' },
  { name: 'Huawei', slug: 'huawei', logo: 'https://cdn.simpleicons.org/huawei/E81F28', tone: 'brand-huawei' },
  { name: 'itel', slug: 'itel', logo: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Itel_Mobile_logo_2023.svg', tone: 'brand-itel' },
  { name: 'nubia', slug: 'nubia', logo: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Nubia_logo.svg', tone: 'brand-nubia' },
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
      <section className="container home-brand-section" id="brand"><div className="home-section-heading"><div><span className="home-kicker">SHOP BY BRAND</span><h2>Brand favorit, <em>satu tempat.</em></h2></div><Link href="/produk">Lihat semua produk <span>↗</span></Link></div><div className="home-brand-grid">{brands.map((brand) => <Link key={brand.name} href={`/produk?brand=${brand.slug}`} className="home-brand-card"><span className={`home-brand-mark ${brand.tone}`}><img src={brand.logo} alt={`${brand.name} logo`} loading="eager" /></span><span className="home-brand-name">{brand.name}</span><span className="home-brand-arrow">↗</span></Link>)}</div></section>
      <section className="home-featured home-segments" id="unggulan"><div className="container"><div className="home-section-heading"><div><span className="home-kicker">FIND YOUR NEXT DEVICE</span><h2>Produk pilihan, <em>sesuai levelmu.</em></h2><p>Jelajahi produk dari berbagai brand berdasarkan kisaran harga. Harga awal dihitung dari varian termurah yang tersedia di katalog.</p></div><Link href="/produk">Jelajahi semua produk <span>↗</span></Link></div>{segments.map((segment) => { const items = productsForSegment(products, segment); return <section key={segment.id} className={`home-segment home-segment-${segment.accent}`} aria-labelledby={`segment-${segment.id}`}><div className="home-segment-heading"><div><span className="home-segment-index">{segment.id === 'entry' ? '01' : segment.id === 'mid' ? '02' : segment.id === 'high' ? '03' : '04'} / SEGMENT</span><h3 id={`segment-${segment.id}`}>{segment.title}</h3><p>{segment.subtitle}</p></div><Link href={`/produk?minPrice=${segment.min}${Number.isFinite(segment.max) ? `&maxPrice=${segment.max}` : ''}&sort=price-${segment.id === 'entry' || segment.id === 'mid' ? 'asc' : 'desc'}`}>Lihat katalog <span>↗</span></Link></div>{items.length ? <div className="grid-products">{items.map((p: any) => <ProductCard key={p.id} p={p} />)}</div> : <div className="home-segment-empty">Belum ada produk dengan kisaran harga ini di katalog. <Link href="/produk">Lihat semua produk</Link></div>}</section>; })}</div></section>
      <section className="container home-contact"><div><span className="home-kicker">NEED A HAND?</span><h2>Masih bingung memilih?</h2><p>Hubungi admin kami untuk bertanya tentang produk, varian, dan proses pemesanan.</p></div><a href="https://wa.me/628565033160" className="home-primary">Chat SEPRI via WhatsApp <span>↗</span></a></section>
      <footer className="home-footer"><div className="container"><Link href="/" className="home-wordmark"><span className="home-logo">B</span><span>B-TECH <b>PHONE</b><small>SMARTER CHOICE. BETTER DEVICE.</small></span></Link><span>Temukan perangkat yang tepat untuk kebutuhanmu.</span><Link href="/produk">Lihat katalog ↗</Link></div></footer>
    </main>
  );
}
