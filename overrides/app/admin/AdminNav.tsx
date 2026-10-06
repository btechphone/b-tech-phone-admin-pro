import Link from 'next/link'

const items = [
  ['/admin', 'Dashboard', 'dashboard', '⌂'],
  ['/admin/pelanggan', 'Pelanggan', 'pelanggan', '♙'],
  ['/admin/pesanan', 'Pesanan', 'pesanan', '▤'],
  ['/admin/pembayaran', 'Pembayaran', 'pembayaran', 'Rp'],
  ['/admin/inventory', 'Inventory', 'inventory', '▦'],
  ['/admin/produk', 'Produk', 'produk', '▣'],
] as const

export default function AdminNav({ current = '' }: { current?: string }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .62 }}>B-Tech Phone</div>
          <div style={{ fontSize: 13, opacity: .72 }}>Admin Panel · Operasional Toko</div>
        </div>
        <Link href="/" className="btn ghost" style={{ fontSize: 12 }}>← Lihat Toko</Link>
      </div>
      <nav aria-label="Navigasi admin" style={{ display: 'flex', gap: 7, overflowX: 'auto', flexWrap: 'nowrap', alignItems: 'center', padding: 8, border: '1px solid var(--border,#e5e7eb)', borderRadius: 16, background: 'var(--card,#fff)', position: 'sticky', top: 10, zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,.05)' }}>
        {items.map(([href, label, key, icon]) => {
          const active = current === key
          return <Link key={key} href={href} aria-current={active ? 'page' : undefined} className={active ? 'btn primary' : 'btn ghost'} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', flex: '0 0 auto', minHeight: 40, fontWeight: active ? 750 : 600 }}><span aria-hidden="true" style={{ fontSize: 14, minWidth: 18, textAlign: 'center' }}>{icon}</span>{label}</Link>
        })}
      </nav>
    </div>
  )
}
