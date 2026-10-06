import Link from 'next/link'

export default function AdminNav({ current = '' }: { current?: string }) {
  const items = [
    ['/admin', 'Dashboard', 'dashboard'],
    ['/admin/pelanggan', 'Pelanggan', 'pelanggan'],
    ['/admin/pesanan', 'Pesanan', 'pesanan'],
    ['/admin/pembayaran', 'Pembayaran', 'pembayaran'],
    ['/admin/inventory', 'Inventory', 'inventory'],
    ['/admin/produk', 'Produk', 'produk'],
  ]
  return <nav aria-label="Navigasi admin" style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',margin:'0 0 24px',padding:'10px',border:'1px solid var(--border,#e5e7eb)',borderRadius:14,background:'var(--card,#fff)',position:'sticky',top:10,zIndex:20}}>{items.map(([href,label,key])=><Link key={key} href={href} className={current===key?'btn primary':'btn ghost'}>{label}</Link>)}</nav>
}
