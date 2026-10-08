'use client'
import {useState} from 'react'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {createClient} from '@/lib/supabase/client'

export default function Login(){
 const supabase=createClient()
 const searchParams=useSearchParams()
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [busy,setBusy]=useState(false)
 const [msg,setMsg]=useState('')
 const queryError=searchParams.get('error')
 const nextPath=searchParams.get('next')||''
 const confirmationMsg=queryError==='confirmation_invalid'?'Link konfirmasi tidak valid. Silakan minta email konfirmasi baru.':queryError==='confirmation_failed'?'Konfirmasi email gagal atau link sudah kedaluwarsa. Silakan daftar ulang atau minta konfirmasi baru.':queryError==='customer_profile_failed'?'Email berhasil dikonfirmasi, tetapi profil pelanggan belum dapat dibuat. Silakan lanjut login dan hubungi admin bila masalah berlanjut.':''
 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setMsg('')
  const {error}=await supabase.auth.signInWithPassword({email,password})
  if(error){setMsg(error.message);setBusy(false);return}
  const {data:isAdmin,error:adminError}=await supabase.rpc('btp_is_admin')
  window.location.href=!adminError&&isAdmin?'/admin':(nextPath.startsWith('/')?nextPath:'/produk')
 }
 return <main className="container" style={{padding:'50px 0',maxWidth:520}}>
  <div className="card" style={{padding:24}}>
   <p className="muted">B-TECH PHONE · AUTH</p><h1>Masuk</h1>
   <p className="muted">Gunakan akun pelanggan atau admin yang terdaftar.</p>
   {(confirmationMsg||msg)&&<p style={{marginBottom:12}}>{confirmationMsg||msg}</p>}
   <form onSubmit={submit} style={{display:'grid',gap:12}}>
    <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:13,borderRadius:10}}/>
    <input required type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:13,borderRadius:10}}/>
    <button className="btn primary" disabled={busy}>{busy?'Memproses…':'Masuk'}</button>
   </form>
   <p className="muted" style={{marginTop:18}}>Belum punya akun? <Link href="/auth/signup">Daftar</Link></p>
  </div>
 </main>
}