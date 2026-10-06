'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminNav from './AdminNav'

const money = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
const statusLabel: Record<string, string> = {
  waiting_payment: 'Menunggu pembayaran', payment_received: 'Pembayaran diterima', processing: 'Diproses', packed: 'Dikemas', shipped: 'Dikirim', completed: 'Selesai', cancelled: 'Dibatalkan'
}

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState({ revenue: 0, orders: 0, pending: 0, processing: 0, shipped: 0, lowStock: 0 })
  const [recent, setRecent] = useState<any[]>([])
  const [trend, setTrend] = useState<{ label: string; value: number }[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true); setError('')
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) { if (active) { setError('Silakan login sebagai admin.'); setLoading(false) }; return }

      const since = new Date(); since.setDate(since.getDate() - 6); since.setHours(0, 0, 0, 0)
      const [payments, orders, inventory, recentOrders] = await Promise.all([
        supabase.from('btp_payments').select('amount,status,created_at').eq('status', 'verified'),
        supabase.from('btp_orders').select('id,order_number,customer_name,total_amount,status,created_at').order('created_at', { ascending: false }),
        supabase.from('btp_inventory').select('stock_quantity,reserved_quantity,low_stock_threshold'),
        supabase.from('btp_orders').select('id,order_number,customer_name,total_amount,status,created_at').order('created_at', { ascending: false }).limit(8),
      ])
      const firstError = payments.error || orders.error || inventory.error || recentOrders.error
      if (firstError) { if (active) { setError(firstError.message); setLoading(false) }; return }

      const paid = payments.data ?? []
      const allOrders = orders.data ?? []
      const inv = inventory.data ?? []
      const revenue = paid.reduce((sum, p) => sum + Number(p.amount || 0), 0)
      const lowStock = inv.filter(x => Math.max(0, Number(x.stock_quantity || 0) - Number(x.reserved_quantity || 0)) <= Number(x.low_stock_threshold || 0)).length
      const pending = allOrders.filter(x => x.status === 'waiting_payment').length
      const processing = allOrders.filter(x => ['payment_received', 'processing', 'packed'].includes(x.status)).length
      const shipped = allOrders.filter(x => x.status === 'shipped').length
      const daily: Record<string, number> = {}
      for (let i = 0; i < 7; i++) { const d = new Date(since); d.setDate(since.getDate() + i); daily[d.toISOString().slice(0, 10)] = 0 }
      paid.forEach(p => { const key = new Date(p.created_at).toISOString().slice(0, 10); if (key in daily) daily[key] += Number(p.amount || 0) })
      const trendData = Object.entries(daily).map(([key, value]) => ({ label: new Date(key + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short' }), value }))

      if (active) { setMetrics({ revenue, orders: allOrders.length, pending, processing, shipped, lowStock }); setRecent(recentOrders.data ?? []); setTrend(trendData); setLoading(false) }
    }
    load(); return () => { active = false }
  }, [supabase])

  const cards = [
    ['Omzet terverifikasi', money(metrics.revenue), 'Pembayaran berstatus verified'],
    ['Total pesanan', String(metrics.orders), 'Semua order yang tercatat'],
    ['Menunggu pembayaran', String(metrics.pending), 'Order belum menerima pembayaran'],
    ['Sedang diproses', String(metrics.processing), 'Payment received / processing / packed'],
    ['Sedang dikirim', String(metrics.shipped), 'Order berstatus shipped'],
    ['Stok rendah', String(metrics.lowStock), 'Varian di bawah threshold'],
  ]

  return <main className="container" style={{ padding: '36px 0 60px' }}>
    <AdminNav current="dashboard" />
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div><p className="muted">B-TECH PHONE · ADMIN</p><h1 style={{ marginBottom: 6 }}>Dashboard Analytics</h1><p className="muted">Pantau omzet, order, pembayaran, pengiriman, dan kesehatan stok dari satu tempat.</p></div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Link className="btn ghost" href="/admin/pembayaran">Pembayaran</Link><Link className="btn ghost" href="/admin/pesanan">Pesanan</Link><Link className="btn primary" href="/admin/inventory">Kelola Stok</Link></div>
    </div>
    {error && <div style={{ marginTop: 20, padding: 14, borderRadius: 12, border: '1px solid #f1b8b8' }}>{error}</div>}
    {loading ? <p className="muted" style={{ marginTop: 30 }}>Memuat analytics…</p> : <>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginTop: 28 }}>
        {cards.map(([title, value, note]) => <div key={title} style={{ border: '1px solid var(--border,#e5e7eb)', borderRadius: 16, padding: 18, background: 'var(--card,#fff)' }}><p className="muted" style={{ margin: 0, fontSize: 13 }}>{title}</p><div style={{ fontSize: 25, fontWeight: 800, marginTop: 7 }}>{value}</div><p className="muted" style={{ margin: '6px 0 0', fontSize: 12 }}>{note}</p></div>)}
      </section>
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(300px,1fr)', gap: 18, marginTop: 20 }}>
        <div style={{ border: '1px solid var(--border,#e5e7eb)', borderRadius: 16, padding: 20 }}><h2 style={{ marginTop: 0 }}>Omzet 7 hari terakhir</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10, alignItems: 'end', minHeight: 190 }}>{trend.map((d, i) => { const max = Math.max(1, ...trend.map(x => x.value)); const h = Math.max(8, Math.round((d.value / max) * 125)); return <div key={i} style={{ textAlign: 'center' }}><div title={money(d.value)} style={{ height: h, borderRadius: 8, background: 'currentColor', opacity: .75, margin: '0 auto 8px', maxWidth: 42 }} /><small className="muted">{d.label}</small><div style={{ fontSize: 10, marginTop: 3 }}>{d.value ? money(d.value).replace('Rp', 'Rp ') : '—'}</div></div> })}</div></div>
        <div style={{ border: '1px solid var(--border,#e5e7eb)', borderRadius: 16, padding: 20 }}><h2 style={{ marginTop: 0 }}>Akses cepat</h2><div style={{ display: 'grid', gap: 10 }}><Link className="btn ghost" href="/admin/produk">Kelola Produk</Link><Link className="btn ghost" href="/admin/media">Media Produk</Link><Link className="btn ghost" href="/admin/pembayaran">Verifikasi Bukti Pembayaran</Link><Link className="btn ghost" href="/admin/pesanan">Update Status & Resi</Link></div></div>
      </section>
      <section style={{ marginTop: 20, border: '1px solid var(--border,#e5e7eb)', borderRadius: 16, padding: 20 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}><h2 style={{ margin: 0 }}>Pesanan terbaru</h2><Link href="/admin/pesanan">Lihat semua →</Link></div><div style={{ overflowX: 'auto', marginTop: 12 }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={{ textAlign: 'left', padding: 10 }}>Order</th><th style={{ textAlign: 'left', padding: 10 }}>Pelanggan</th><th style={{ textAlign: 'right', padding: 10 }}>Total</th><th style={{ textAlign: 'left', padding: 10 }}>Status</th></tr></thead><tbody>{recent.map(o => <tr key={o.id} style={{ borderTop: '1px solid var(--border,#e5e7eb)' }}><td style={{ padding: 10 }}>{o.order_number}</td><td style={{ padding: 10 }}>{o.customer_name}</td><td style={{ padding: 10, textAlign: 'right' }}>{money(Number(o.total_amount || 0))}</td><td style={{ padding: 10 }}>{statusLabel[o.status] || o.status}</td></tr>)}{recent.length === 0 && <tr><td colSpan={4} className="muted" style={{ padding: 18, textAlign: 'center' }}>Belum ada pesanan.</td></tr>}</tbody></table></div></section>
    </>}
  </main>
}
