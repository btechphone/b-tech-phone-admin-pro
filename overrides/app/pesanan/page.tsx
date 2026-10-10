'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {createClient} from '@/lib/supabase/client'
const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)
const ext=(name:string)=>name.split('.').pop()?.toLowerCase()||'bin'
export default function Orders(){
 const supabase=createClient()
 const [orders,setOrders]=useState<any[]>([]);const [user,setUser]=useState<any>(null);const [files,setFiles]=useState<Record<string,File>>({});const [busy,setBusy]=useState<string|null>(null);const [msg,setMsg]=useState('');const [loading,setLoading]=useState(true)
 async function load(){setLoading(true);setMsg('');try{const {data:u,error:authError}=await supabase.auth.getUser();if(authError)throw new Error('Tidak dapat memeriksa sesi login. Silakan masuk kembali.');setUser(u.user);if(!u.user){setOrders([]);return}const {data:customer,error:customerError}=await supabase.from('btp_customers').select('id').eq('auth_user_id',u.user.id).maybeSingle();if(customerError)throw new Error('Gagal memuat data pelanggan: '+customerError.message);if(!customer){setOrders([]);return}const {data,error}=await supabase.from('btp_orders').select('id,order_number,total_amount,status,shipping_courier,tracking_number,created_at,btp_payments(id,amount,status,proof_url,rejection_reason)').eq('customer_id',customer.id).order('created_at',{ascending:false});if(error)throw new Error('Gagal memuat pesanan: '+error.message);setOrders(data||[])}catch(error:any){setMsg(error?.message||'Gagal memuat pesanan. Periksa koneksi lalu coba kembali.')}finally{setLoading(false)}}
 useEffect(()=>{load()},[])
 async function submitProof(paymentId:string){
  const file=files[paymentId];if(!file)return setMsg('Pilih file bukti pembayaran terlebih dahulu.')
  if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type))return setMsg('Format harus JPG, PNG, WEBP, atau PDF.')
  if(file.size>5*1024*1024)return setMsg('Ukuran bukti pembayaran maksimal 5 MB.')
  if(!user)return setMsg('Sesi login tidak ditemukan. Silakan masuk kembali.')
  setBusy(paymentId);setMsg('')
  let uploadedPath:string|undefined
  try{
   const path=`${user.id}/${paymentId}-${Date.now()}.${ext(file.name)}`
   const {error:uploadError}=await supabase.storage.from('btp-payment-proofs').upload(path,file,{contentType:file.type,upsert:false})
   if(uploadError)throw new Error('Upload gagal: '+uploadError.message)
   uploadedPath=path
   const {error}=await supabase.rpc('btp_submit_payment_proof',{p_payment_id:paymentId,p_proof_url:path})
   if(error)throw new Error('Gagal menyimpan bukti: '+error.message)
   uploadedPath=undefined
   setMsg('Bukti pembayaran berhasil dikirim. Menunggu verifikasi admin.')
   setFiles(current=>{const next={...current};delete next[paymentId];return next})
   await load()
  }catch(error:any){
   if(uploadedPath)try{await supabase.storage.from('btp-payment-proofs').remove([uploadedPath])}catch{}
   setMsg(error?.message||'Terjadi gangguan saat mengirim bukti pembayaran. Periksa koneksi lalu coba kembali.')
  }finally{setBusy(null)}
 }
 if(loading)return <main className="container" style={{padding:'50px 0'}}><h1>Pesanan</h1><p className="muted">Memeriksa sesi dan memuat pesanan…</p></main>;if(!user)return <main className="container" style={{padding:'50px 0'}}><h1>Pesanan</h1>{msg&&<p role="alert">{msg}</p>}<p className="muted">Silakan masuk untuk melihat pesanan.</p><Link className="btn primary" href="/auth/login">Masuk</Link></main>
 return <main className="container" style={{padding:'40px 0'}}><h1>Pesanan Saya</h1>{msg&&<p>{msg}</p>}{!orders.length?<p className="muted">{msg?'Pesanan belum dapat dimuat.': 'Belum ada pesanan.'}</p>:<div style={{display:'grid',gap:14}}>{orders.map(o=>{const p=o.btp_payments?.[0];return <article className="card" style={{padding:20}} key={o.id}><div style={{display:'flex',justifyContent:'space-between',gap:15,flexWrap:'wrap'}}><div><strong>{o.order_number}</strong><div className="muted">{new Date(o.created_at).toLocaleString('id-ID')}</div></div><span className="badge">{o.status}</span></div><h3>{money(Number(o.total_amount))}</h3>{p&&<div style={{borderTop:'1px solid #1e293b',paddingTop:14}}><div className="muted">Pembayaran: {p.status}</div>{p.status==='pending'&&<div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setFiles({...files,[p.id]:e.target.files?.[0] as File})} style={{flex:1,minWidth:240,padding:10,borderRadius:9}}/><button className="btn primary" disabled={busy===p.id} onClick={()=>submitProof(p.id)}>{busy===p.id?'Mengunggah...':'Kirim Bukti'}</button></div>}{p.status==='rejected'&&<><p>Ditolak: {p.rejection_reason||'silakan kirim ulang bukti.'}</p><div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setFiles({...files,[p.id]:e.target.files?.[0] as File})} style={{flex:1,minWidth:240,padding:10,borderRadius:9}}/><button className="btn primary" disabled={busy===p.id} onClick={()=>submitProof(p.id)}>{busy===p.id?'Mengunggah...':'Kirim Ulang'}</button></div></>}</div>}{o.tracking_number&&<p className="muted">Resi: {o.tracking_number} {o.shipping_courier&&'· '+o.shipping_courier}</p>}</article>})}</div>}</main>
}