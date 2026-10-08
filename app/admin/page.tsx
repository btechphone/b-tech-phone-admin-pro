import Link from 'next/link'
import {redirect} from 'next/navigation'
import {createClient} from '@/lib/supabase/server'

const modules=[
 {title:'Produk',desc:'Kelola katalog, harga, variant dan status produk.',href:'/produk',icon:'▣'},
 {title:'Inventory',desc:'Pantau stok dan ketersediaan produk.',href:'/produk',icon:'◫'},
 {title:'Pesanan',desc:'Lihat dan proses pesanan pelanggan.',href:'/pesanan',icon:'🛒'},
 {title:'Pembayaran',desc:'Periksa bukti transfer dan verifikasi pembayaran.',href:'/admin/pembayaran',icon:'✓'},
 {title:'Media Produk',desc:'Kelola foto utama dan galeri produk.',href:'/admin/media',icon:'▤'},
 {title:'Catalog',desc:'Buka tampilan katalog pelanggan.',href:'/produk',icon:'⌕'}
]

export default async function Admin(){
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user) redirect('/auth/login')
 const {data:isAdmin,error}=await supabase.rpc('btp_is_admin')
 if(error || !isAdmin) redirect('/produk')
 return <main className="admin-page"><div className="container"><div className="admin-hero"><div><div className="section-kicker">B-TECH PHONE · ADMIN</div><h1>Dashboard Utama Admin</h1><p className="muted">Selamat datang kembali. Kelola operasional toko dari satu tempat.</p><div className="admin-user">● {user.email}</div></div><div className="admin-hero-actions"><Link className="btn ghost" href="/">← Website</Link><Link className="btn primary" href="/produk">Kelola Produk</Link></div></div><div className="admin-grid">{modules.map(m=><Link href={m.href} key={m.title} className="admin-module-card"><div className="admin-module-icon">{m.icon}</div><div><h2>{m.title}</h2><p>{m.desc}</p></div><span>→</span></Link>)}</div></div></main>
}