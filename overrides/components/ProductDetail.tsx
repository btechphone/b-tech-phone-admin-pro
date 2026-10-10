'use client'
import {useState} from 'react'
import Link from 'next/link'
import {addToCart} from '@/lib/cart'

export function ProductDetail({product}:any){
 const variants=product.variants||[]
 const [id,setId]=useState(variants[0]?.id)
 const [active,setActive]=useState(0)
 const [cartMessage,setCartMessage]=useState('')
 const v=variants.find((x:any)=>x.id===id)
 const images=[...(product.btp_product_images||[])].sort((a:any,b:any)=>a.sort_order-b.sort_order).map((x:any)=>({url:x.asset_url||x.source_url||`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/btp-product-images/${x.storage_path}`,alt:x.alt_text||product.name}))
 if(product.image_url&&!images.length)images.push({url:product.image_url,alt:product.name})
 const formatPrice=(n:number)=>n>0?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n):'Harga belum tersedia'
 return <div className="detail">
  <div>
   <div className="detail-image product-gallery-main">{images[active]?<img src={images[active].url} alt={images[active].alt}/>:<span>📱</span>}</div>
   {images.length>1&&<div className="gallery-thumbs">{images.map((im:any,i:number)=><button type="button" key={im.url} className={i===active?'gallery-thumb active':'gallery-thumb'} onClick={()=>setActive(i)}><img src={im.url} alt=""/></button>)}</div>}
  </div>
  <div>
   <p className="eyebrow">{product.brand?.name}</p>
   <h1>{product.name}</h1>
   <p>{product.short_description||product.description}</p>
   <h3>Seluruh varian</h3>
   <div className="variant-list">
    {variants.map((x:any)=><button type="button" key={x.id} className={x.id===id?'variant active':'variant'} onClick={()=>{setId(x.id);setCartMessage('')}}>
      <span>{x.variant_name}</span>
      <small>{formatPrice(Number(x.price))} · {x.available?'Stok tersedia':'Stok habis'}</small>
    </button>)}
   </div>
   {v&&<div className="product-purchase">
    <p className="price">{formatPrice(Number(v.price))}</p>
    <p className={v.available?'stock-ok':'stock-out'}>{v.available?'Stok tersedia':'Stok habis'}</p>
    {Number(v.price)<=0&&<p className="muted">Harga varian ini belum ditentukan. Silakan hubungi admin.</p>}
    <button className="button" disabled={!v.available||Number(v.price)<=0} onClick={()=>{try{addToCart({variantId:v.id,productId:product.id,productName:product.name,variantName:v.variant_name,sku:v.sku,price:Number(v.price),imageUrl:images[0]?.url||product.image_url,quantity:1});setCartMessage('Berhasil ditambahkan ke keranjang.')}catch{setCartMessage('Produk belum berhasil ditambahkan. Periksa pengaturan browser lalu coba lagi.')}}}>Tambah ke keranjang</button>
    {cartMessage&&<div role="status" aria-live="polite" className="cart-add-feedback"><p>{cartMessage}</p>{cartMessage.startsWith('Berhasil')&&<Link href="/keranjang">Lihat keranjang →</Link>}</div>
   </div>}
  </div>
 </div>
}
