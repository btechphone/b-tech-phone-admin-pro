'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {createClient} from '@/lib/supabase/client'
const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)
const ext=(name:string)=>name.split('.').pop()?.toLowerCase()||'bin'
export default function Orders(){
 const supabase=createClient()
 const [orders,setOrders]=useState<any[]>([]);const [user,setUser]=useState<any>(null);const [files,setFiles]=useState<Record<string,File>>({});const [busy,setBusy]=useState<string|null>(null);const [msg,setMsg]=useState('')
 async function load(){const {data:u}=await supabase.auth.getUser();setUser(u.user);if(!u.user)return;const {data,error}=await supabase.from('btp_orders').select('id,order_number,total_amount,status,shipping_courier,tracking_number,created_at,btp_payments(id,amount,status,proof_url,rejection_reason)').order('created_at',{ascending:false});if(error)setMsg(error.message);else setOrders(data||[])}
 useEffect(()=>{load()},[])
 async function submitProof(paymentId:string){
  const file=files[paymentId];if(!file)return setMsg('Pilih file bukti pembayaran terlebih dahulu.')
  if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type))return setMsg('Format harus JPG, PNG, WEBP, atau PDF.')
  if(file.size>5*1024*1024)return setMsg('Ukuran bukti pembayaran maksimal 5 MB.')
  if(!user)return
  setBusy(paymentId);setMsg('')
  const path=`${user.id}/${paymentId}-${Date.now()}.${ext(file.name)}`
  const {error:uploadError}=await supabase.storage.from('btp-payment-proofs').upload(path,file,{contentType:file.type,upsert:false})
  if(uploadError){setBusy(null);return setMsg('Upload gagal: '+uploadError.message)}
  const {error}=await supabase.from('btp_payments').update({proof_url:path,status:'submitted'}).eq('id',paymentId)
  if(error){await supabase.storage.from('btp-payment-proofs').remove([path]);setMsg('Gagal menyimpan bukti: '+error.message)}else{setMsg('Bukti pembayaran berhasil dikirim. Menunggu verifikasi admin.');setFiles({...files,[paymentId]:undefined as any});await load()}
  setBusy(null)
 }
 if(!user)return <main className="container" style={{padding:'50px 0'}}><h1>Pesanan</h1><p className="muted">Silakan masuk untuk melihat pesanan.</p><Link className="btn primary" href="/auth/login">Masuk</Link></main>
 return <main className="container" style={{padding:'40px 0'}}><h1>Pesanan Saya</h1>{msg&&<p>{msg}</p>}{!orders.length?<p className="muted">Belum ada pesanan.</p>:<div style={{display:'grid',gap:14}}>{orders.map(o=>{const p=o.btp_payments?.[0];return <article className="card" style={{padding:20}} key={o.id}><div style={{display:'flex',justifyContent:'space-between',gap:15,flexWrap:'wrap'}}><div><strong>{o.order_number}</strong><div className="muted">{new Date(o.created_at).toLocaleString('id-ID')}</div></div><span className="badge">{o.status}</span></div><h3>{money(Number(o.total_amount))}</h3>{p&&<div style={{borderTop:'1px solid #1e293b',paddingTop:14}}><div className="muted">Pembayaran: {p.status}</div>{p.status==='pending'&&<div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setFiles({...files,[p.id]:e.target.files?.[0] as File})} style={{flex:1,minWidth:240,padding:10,borderRadius:9}}/><button className="btn primary" disabled={busy===p.id} onClick={()=>submitProof(p.id)}>{busy===p.id?'Mengunggah...':'Kirim Bukti'}</button></div>}{p.status==='rejected'&&<><p>Ditolak: {p.rejection_reason||'silakan kirim ulang bukti.'}</p><div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setFiles({...files,[p.id]:e.target.files?.[0] as File})} style={{flex:1,minWidth:240,padding:10,borderRadius:9}}/><button className="btn primary" disabled={busy===p.id} onClick={()=>submitProof(p.id)}>{busy===p.id?'Mengunggah...':'Kirim Ulang'}</button></div></>}</div>}{o.tracking_number&&<p className="muted">Resi: {o.tracking_number} {o.shipping_courier&&'· '+o.shipping_courier}</p>}</article>})}</div>}</main>
