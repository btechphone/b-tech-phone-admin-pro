'use client'

import {useEffect,useMemo,useState} from 'react'
import {createBrowserClient} from '@supabase/ssr'

const supabase=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)

type Product={id:string;name:string;slug:string;brand:{name:string}}
type ImageRow={id:string;storage_path:string;alt_text:string|null;sort_order:number;is_primary:boolean;source_url:string|null;asset_url:string|null;verified_exact_model:boolean}

export default function ProductMediaAdmin(){
 const [products,setProducts]=useState<Product[]>([]),[selected,setSelected]=useState(''),[images,setImages]=useState<ImageRow[]>([])
 const [file,setFile]=useState<File|null>(null),[sourceUrl,setSourceUrl]=useState(''),[assetUrl,setAssetUrl]=useState(''),[exact,setExact]=useState(false),[primary,setPrimary]=useState(true),[alt,setAlt]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 const product=useMemo(()=>products.find(p=>p.id===selected),[products,selected])
 async function loadProducts(){const {data,error}=await supabase.from('btp_products').select('id,name,slug,brand:btp_brands!inner(name)').eq('is_active',true).eq('btp_brands.is_active',true).order('name');if(error){setMessage(error.message);return}setProducts((data||[]) as unknown as Product[]);if(!selected&&data?.[0])setSelected(data[0].id)}
 async function loadImages(id:string){if(!id){setImages([]);return}const {data,error}=await supabase.from('btp_product_images').select('id,storage_path,alt_text,sort_order,is_primary,source_url,asset_url,verified_exact_model').eq('product_id',id).order('sort_order');if(error){setMessage(error.message);return}setImages(data||[])}
 useEffect(()=>{loadProducts()},[]);useEffect(()=>{loadImages(selected)},[selected])
 async function importOfficial(){
  if(!product)return
  if(!exact){setMessage('Centang Exact Model setelah verifikasi model.');return}
  if(!sourceUrl.trim()){setMessage('URL halaman sumber resmi manufacturer wajib diisi. URL gambar langsung opsional; sistem dapat mengambil og:image dari halaman resmi.');return}
  setBusy(true);setMessage('')
  try{
   const nextSort=images.length?Math.max(...images.map(x=>x.sort_order))+1:0
   const {data,error}=await supabase.functions.invoke('btp-import-official-image',{body:{product_id:product.id,asset_url:assetUrl.trim(),source_url:sourceUrl.trim(),alt_text:alt||product.name,sort_order:nextSort,is_primary:primary}})
   if(error)throw error
   if(data?.error)throw new Error(data.error)
   setSourceUrl('');setAssetUrl('');setAlt('');setExact(false);setPrimary(false);setMessage(data?.asset_url?'Asset resmi berhasil diimpor ke Storage dan database.':'Asset resmi berhasil diimpor ke Storage dan database.');await loadImages(product.id)
  }catch(e:any){setMessage(e?.message||'Import asset gagal.')}finally{setBusy(false)}
 }
 async function upload(){
  if(!product||!file)return
  if(!exact) { setMessage('Centang Exact Model setelah verifikasi model.'); return }
  if(!sourceUrl.trim()) { setMessage('URL sumber resmi manufacturer wajib diisi untuk asset exact-model.'); return }
  setBusy(true);setMessage('')
  try{
   if(!file.type.startsWith('image/'))throw new Error('File harus berupa gambar.')
   if(file.size>10*1024*1024)throw new Error('Ukuran maksimum 10 MB.')
   const ext=(file.name.split('.').pop()||'jpg').toLowerCase()
   const path=product.slug+'/'+Date.now()+'-'+crypto.randomUUID()+'.'+ext
   const up=await supabase.storage.from('btp-product-images').upload(path,file,{contentType:file.type,cacheControl:'31536000',upsert:false})
   if(up.error)throw up.error
   if(primary){const reset=await supabase.from('btp_product_images').update({is_primary:false}).eq('product_id',product.id);if(reset.error)throw reset.error}
   const nextSort=images.length?Math.max(...images.map(x=>x.sort_order))+1:0
   const ins=await supabase.from('btp_product_images').insert({product_id:product.id,storage_path:path,alt_text:alt||product.name,sort_order:nextSort,is_primary:primary,source_url:sourceUrl||null,source_type:'official_manufacturer',verified_exact_model:exact}).select().single()
   if(ins.error){await supabase.storage.from('btp-product-images').remove([path]);throw ins.error}
   if(primary){const pub=supabase.storage.from('btp-product-images').getPublicUrl(path).data.publicUrl;await supabase.from('btp_products').update({image_url:pub}).eq('id',product.id)}
   setFile(null);setSourceUrl('');setAssetUrl('');setAlt('');setExact(false);setPrimary(false);setMessage('Foto berhasil disimpan ke Storage dan database.');await loadImages(product.id)
  }catch(e:any){setMessage(e?.message||'Upload gagal.')}finally{setBusy(false)}
 }
 async function removeImage(img:ImageRow){if(!confirm('Hapus foto ini?'))return;setBusy(true);setMessage('');const del=await supabase.from('btp_product_images').delete().eq('id',img.id);if(del.error){setMessage(del.error.message);setBusy(false);return}await supabase.storage.from('btp-product-images').remove([img.storage_path]);if(img.is_primary)await supabase.from('btp_products').update({image_url:null}).eq('id',selected);await loadImages(selected);setBusy(false)}
 return <main className="container" style={{padding:'40px 0 80px'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'end',marginBottom:24,flexWrap:'wrap'}}><div><p className="eyebrow">ADMIN · MEDIA PRODUK</p><h1>Foto Produk</h1><p className="muted">Upload foto resmi per model. Asset disimpan di Supabase Storage.</p></div><span className="badge">{products.length} model aktif</span></div>
  <section className="card" style={{padding:20,marginBottom:20}}><label style={{display:'block',fontWeight:700,marginBottom:8}}>Pilih model</label><select value={selected} onChange={e=>setSelected(e.target.value)} style={{width:'100%',padding:12,borderRadius:10}}>{products.map(p=><option key={p.id} value={p.id}>{p.brand?.name} · {p.name}</option>)}</select>{product&&<p className="muted" style={{marginTop:8}}>Slug: {product.slug}</p>}</section>
  <section className="card" style={{padding:20,marginBottom:20}}><h2>Upload asset resmi</h2><div style={{display:'grid',gap:12,marginTop:14}}><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>setFile(e.target.files?.[0]||null)}/><input value={alt} onChange={e=>setAlt(e.target.value)} placeholder="Alt text" style={{padding:12,borderRadius:10}}/><input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="URL halaman sumber resmi manufacturer (wajib)" style={{padding:12,borderRadius:10}} required/><input value={assetUrl} onChange={e=>setAssetUrl(e.target.value)} placeholder="URL langsung file gambar resmi (opsional — kosongkan untuk auto-detect og:image)" style={{padding:12,borderRadius:10}}/><label><input type="checkbox" checked={exact} onChange={e=>setExact(e.target.checked)}/> Saya sudah memverifikasi foto ini adalah exact model</label><label><input type="checkbox" checked={primary} onChange={e=>setPrimary(e.target.checked)}/> Jadikan foto utama</label><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button className="btn primary" disabled={!file||!exact||busy} onClick={upload}>{busy?'Mengunggah…':'Upload Foto Resmi'}</button><button className="btn ghost" disabled={!sourceUrl||!exact||busy} onClick={importOfficial}>{busy?'Memproses…':'Import URL Resmi'}</button></div></div>{message&&<p style={{marginTop:12}}>{message}</p>}</section>
  <section className="card" style={{padding:20}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2>Gallery {product?.name}</h2><span className="muted">{images.length} foto</span></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16,marginTop:16}}>{images.map(img=>{const url=supabase.storage.from('btp-product-images').getPublicUrl(img.storage_path).data.publicUrl;return <article key={img.id} style={{border:'1px solid #e5e7eb',borderRadius:14,overflow:'hidden'}}><img src={url} alt={img.alt_text||''} style={{width:'100%',aspectRatio:'1/1',objectFit:'contain',background:'#f8fafc'}}/><div style={{padding:10,fontSize:12}}><strong>{img.is_primary?'PRIMARY':'Gallery'}</strong><br/><span className="muted">{img.verified_exact_model?'Exact model ✓':'Belum diverifikasi'}</span>{img.source_url&&<><br/><a href={img.source_url} target="_blank" rel="noreferrer" className="muted">Sumber resmi ↗</a></>}<button className="btn ghost" style={{marginTop:8,width:'100%'}} onClick={()=>removeImage(img)}>Hapus</button></div></article>})}</div>{!images.length&&<p className="muted" style={{marginTop:16}}>Belum ada foto untuk model ini.</p>}</section>
 </main>
}
