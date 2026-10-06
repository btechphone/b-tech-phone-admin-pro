import Link from 'next/link'
export default function ProductCard({p}:any){
 const v=p.variants?.[0]||p.btp_product_variants?.[0]
 const img=p.image_url||p.gallery_urls?.[0]
 const brand=p.brand?.name||p.btp_brands?.name||p.category
 const price=v?.price?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(v.price):'Hubungi admin'
 return <article className="product-card"><Link href={'/produk/'+p.slug} className="product-media">{img?<img src={img} alt={p.name}/>:<div className="product-placeholder"><span>B-TECH</span></div>}<span className="product-brand">{brand}</span></Link><div className="product-info"><div className="product-name-row"><h3>{p.name}</h3><span className="product-chevron">↗</span></div><p>{v?.variant_name||'Pilih varian'}{v?.storage?' · '+v.storage:''}</p><strong>{price}</strong></div></article>
}