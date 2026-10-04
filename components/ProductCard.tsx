import Link from 'next/link'
export default function ProductCard({p}:any){
 const v=p.btp_product_variants?.[0]
 const img=p.image_url||p.gallery_urls?.[0]
 return <article className="card" style={{overflow:'hidden'}}>
  <Link href={'/produk/'+p.slug}>{img?<img src={img} alt={p.name} style={{width:'100%',aspectRatio:'1/1',objectFit:'cover'}}/>:<div style={{aspectRatio:'1/1',display:'grid',placeItems:'center',background:'#111827'}} className="muted">B-TECH</div>}</Link>
  <div style={{padding:15}}><div className="muted" style={{fontSize:12}}>{p.btp_brands?.name||p.category}</div><h3 style={{margin:'5px 0 8px'}}>{p.name}</h3><div className="muted" style={{fontSize:13}}>{v?.variant_name||'Pilih varian'}</div><strong style={{display:'block',marginTop:10}}>{v?.price?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(v.price):'Hubungi admin'}</strong></div>
 </article>
}