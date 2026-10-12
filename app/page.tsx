import Link from 'next/link';
import { getProducts } from '@/lib/server-catalog';
import ProductCard from '@/components/ProductCard';

const categories = [
  { label: 'Smartphone', icon: '📱', href: '/produk' },
  { label: 'Tablet Android', icon: '▣', href: '/produk' },
  { label: 'iPad', icon: '▤', href: '/produk' },
  { label: 'Flagship', icon: '✦', href: '/produk' },
  { label: 'Aksesoris', icon: '⌁', href: '/produk' },
];
const brands = [{label:'Samsung',slug:'samsung'},{label:'Apple',slug:'apple'},{label:'Vivo',slug:'vivo'},{label:'OPPO',slug:'oppo'},{label:'Xiaomi',slug:'xiaomi'},{label:'Infinix',slug:'infinix'},{label:'TECNO',slug:'tecno'},{label:'itel',slug:'itel'},{label:'Nubia',slug:'nubia'},{label:'Realme',slug:'realme'},{label:'Huawei',slug:'huawei'}];

export default async function Home() {
  const products = await getProducts();
  const featured = products.slice(0, 8);
  return <main className="marketplace">
    <section className="market-top">
      <div className="container market-top-inner">
        <div className="market-welcome"><span className="live-dot" /> Marketplace gadget pilihanmu</div>
        <div className="market-benefits"><span>✓ Produk pilihan</span><span>✓ Harga transparan</span><span>✓ Bantuan admin</span></div>
      </div>
    </section>
    <section className="market-hero-wrap">
      <div className="container">
        <div className="market-hero">
          <div className="market-hero-copy">
            <div className="hero-pill">B-TECH PHONE · GADGET MARKETPLACE</div>
            <h1>Upgrade gadget.<br/><span>Naik level.</span></h1>
            <p>Temukan smartphone, tablet Android, dan iPad dari berbagai brand dalam satu tempat.</p>
            <div className="market-hero-actions"><Link className="market-cta" href="/produk">Belanja sekarang <span>↗</span></Link><Link className="market-secondary" href="/keranjang">Lihat keranjang</Link></div>
            <div className="hero-trust"><span>●</span> Cari produk · Bandingkan varian · Konsultasi sebelum beli</div>
          </div>
          <div className="hero-visual" aria-label="Pilihan perangkat digital">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="device device-tablet"><div className="device-screen tablet-screen"><div className="screen-glow" /><div className="screen-label">CREATE<br/>MORE.</div></div></div>
            <div className="device device-phone"><div className="device-screen phone-screen"><div className="phone-camera" /><div className="screen-time">10:08</div><div className="screen-wave" /></div></div>
            <div className="float-tag tag-top">SMARTPHONE <b>↗</b></div><div className="float-tag tag-bottom">TABLET & iPAD <b>✦</b></div>
          </div>
        </div>
      </div>
    </section>
    <section className="container market-categories">
      <div className="market-section-head"><div><span className="market-kicker">PILIH KATEGORI</span><h2>Belanja sesuai kebutuhan</h2></div><Link href="/produk" className="market-see-all">Semua produk ↗</Link></div>
      <div className="category-strip">{categories.map((c,i)=><Link href={c.href} className="category-tile" key={c.label}><span className={'category-symbol category-symbol-'+i}>{c.icon}</span><strong>{c.label}</strong><span className="category-arrow">↗</span></Link>)}</div>
    </section>
    <section className="container market-brands">
      <div className="market-section-head"><div><span className="market-kicker">BRAND FAVORIT</span><h2>Temukan brand pilihanmu</h2></div></div>
      <div className="brand-pills">{brands.map((b,i)=><Link href={'/produk?brand='+b.slug} key={b.slug} className="brand-pill"><span className={'brand-initial brand-initial-'+(i%6)}>{b.label==='Apple'?'●':b.label.slice(0,1)}</span>{b.label}<span className="pill-arrow">↗</span></Link>)}</div>
    </section>
    <section className="market-promo-wrap"><div className="container"><div className="market-promo"><div><span className="market-kicker">SHOP SMARTER</span><h2>Gadget yang pas,<br/>pilihan yang lebih yakin.</h2><p>Butuh rekomendasi? Tanyakan produk dan varian yang sesuai kebutuhanmu.</p><a href="https://wa.me/628565033160" className="promo-button">Konsultasi via WhatsApp ↗</a></div><div className="promo-art"><span className="promo-disc disc-a" /><span className="promo-disc disc-b" /><span className="promo-phone">B<span>+</span></span><span className="promo-spark">✦</span></div></div></div></section>
    <section className="container market-products">
      <div className="market-section-head"><div><span className="market-kicker">PILIHAN UNTUKMU</span><h2>Produk pilihan</h2><p className="market-subtitle">Jelajahi perangkat favorit, dari daily driver hingga flagship.</p></div><Link href="/produk" className="market-see-all">Lihat semua produk ↗</Link></div>
      {featured.length ? <div className="grid-products">{featured.map((p:any)=><ProductCard key={p.id} p={p}/>)}</div> : <div className="market-empty"><span>⌕</span><h3>Produk sedang disiapkan</h3><p>Katalog akan tampil di sini setelah produk tersedia.</p><Link href="/produk" className="market-cta">Buka katalog ↗</Link></div>}
    </section>
    <section className="container market-service-row"><div><span>01</span><strong>Informasi jelas</strong><p>Harga dan varian ditampilkan agar mudah dibandingkan.</p></div><div><span>02</span><strong>Konsultasi langsung</strong><p>Tanya admin sebelum menentukan pilihan.</p></div><div><span>03</span><strong>Checkout praktis</strong><p>Lanjutkan pesanan dari keranjang ke checkout.</p></div></section>
  </main>;
}