'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {createClient} from '@/lib/supabase/client'
const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)

export default function Orders(){
 const supabase=createClient()
 const [orders,setOrders]=useState<any[]>([])
 const [user,setUser]=useState<any>(null)
 const [proof,setProof]=useState<Record<string,File|null>>({})
 const [busy,setBusy]=useState<Record<string,boolean>>({})
 const [msg,setMsg]=useState('')

 async function load(){
  const {data:u}=await supabase.auth.getUser()
  setUser(u.user)
  if(!u.user)return
  const {data,error}=await supabase.from('btp_orders').select('id,order_number,total_amount,status,shipping_courier,tracking_number,created_at,btp_payments(id,amount,status,proof_url,rejection_reason)').order('created_at',{ascending:false})
  if(error)setMsg(error.message);else setOrders(data||[])
 }
 useEffect(()=>{load()},[])

 async function submitProof(paymentId:string){
  const file=proof[paymentId]
  if(!file){setMsg('Pilih file bukti transfer terlebih dahulu.');return}
  if(file.size>5*1024*1024){setMsg('Ukuran bukti pembayaran maksimal 5 MB.');return}
  const allowed=['image/jpeg','image/png','image/webp','application/pdf']
  if(!allowed.includes(file.type)){setMsg('Format yang didukung: JPG, PNG, WEBP atau PDF.');return}
  if(!user){setMsg('Sesi login tidak ditemukan. Silakan login kembali.');return}
  setBusy(prev=>({...prev,[paymentId]:true}));setMsg('')
  const ext=(file.name.split('.').pop()||'bin').toLowerCase()
  const path=`${user.id}/${paymentId}-${Date.now()}.${ext}`
  const {error:uploadError}=await supabase.storage.from('btp-payment-proofs').upload(path,file,{contentType:file.type,cacheControl:'3600',upsert:false})
  if(uploadError){setMsg('Gagal upload bukti: '+uploadError.message);setBusy(prev=>({...prev,[paymentId]:false}));return}
  const {error}=await supabase.rpc('btp_submit_payment_proof',{p_payment_id:paymentId,p_proof_url:path})
  if(error){
   await supabase.storage.from('btp-payment-proofs').remove([path])
   setMsg('Gagal menyimpan bukti: '+error.message)
  }else{
   setMsg('Bukti pembayaran berhasil dikirim. Menunggu verifikasi admin.')
   setProof(prev=>({...prev,[paymentId]:null}))
   await load()
  }
  setBusy(prev=>({...prev,[paymentId]:false}))
 }

 if(!user)return <main className="container" style={{padding:'50px 0'}}><h1>Pesanan</h1><p className="muted">Silakan masuk untuk melihat pesanan.</p><Link className="btn primary" href="/auth/login?next=/pesanan">Masuk</Link></main>
 return <main className="container" style={{padding:'40px 0'}}>
  <h1>Pesanan Saya</h1>{msg&&<p>{msg}</p>}
  {!orders.length?<p className="muted">Belum ada pesanan.</p>:<div style={{display:'grid',gap:14}}>{orders.map(o=>{const p=o.btp_payments?.[0];return <article className="card" style={{padding:20}} key={o.id}>
   <div style={{display:'flex',justifyContent:'space-between',gap:15,flexWrap:'wrap'}}><div><strong>{o.order_number}</strong><div className="muted">{new Date(o.created_at).toLocaleString('id-ID')}</div></div><span className="badge">{o.status}</span></div>
   <h3>{money(Number(o.total_amount))}</h3>
   {p&&<div style={{borderTop:'1px solid #1e293b',paddingTop:14}}>
    <div className="muted">Pembayaran: {p.status}</div>
    {(p.status==='pending'||p.status==='rejected')&&<div style={{display:'grid',gap:8,marginTop:10}}>
      <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setProof(prev=>({...prev,[p.id]:e.target.files?.[0]||null}))}/>
      <small className="muted">JPG, PNG, WEBP atau PDF · maksimal 5 MB</small>
      <button className="btn primary" disabled={!!busy[p.id]} onClick={()=>submitProof(p.id)}>{busy[p.id]?'Mengunggah…':'Upload Bukti Pembayaran'}</button>
    </div>}
    {p.status==='rejected'&&<p>Ditolak: {p.rejection_reason||'silakan kirim ulang bukti.'}</p>}
    {p.status==='submitted'&&<p className="muted">Bukti sudah dikirim dan sedang menunggu verifikasi admin.</p>}
   </div>}
   {o.tracking_number&&<p className="muted">Resi: {o.tracking_number} {o.shipping_courier&&'· '+o.shipping_courier}</p>}
  </article>})}</div>}
 </main>
}