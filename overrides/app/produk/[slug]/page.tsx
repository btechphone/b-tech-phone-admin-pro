import {notFound} from 'next/navigation'
import {createClient} from '@/lib/supabase/server'
import {ProductDetail} from '@/components/ProductDetail'

export default async function ProductPage({params}:any){
 const {slug}=await params
 const s=await createClient()
 const {data:product,error}=await s.from('btp_products')
   .select('id,name,slug,category,short_description,description,image_url,gallery_urls,btp_brands!inner(id,name,slug),btp_product_images(id,storage_path,alt_text,sort_order),btp_product_variants(id,sku,variant_name,color,storage,ram,price,compare_at_price,is_active)')
   .eq('slug',slug)
   .eq('is_active',true)
   .maybeSingle()
 if(error)throw error
 if(!product)notFound()

 const variants=(product.btp_product_variants||[]).filter((v:any)=>v.is_active!==false&&Number(v.price)>0)
 const ids=variants.map((v:any)=>v.id)
 let availability:any[]=[]
 if(ids.length){
   const {data,error:availabilityError}=await s.from('btp_public_variant_availability').select('variant_id,available').in('variant_id',ids)
   if(availabilityError)throw availabilityError
   availability=data||[]
 }
 const map=new Map(availability.map((x:any)=>[x.variant_id,Boolean(x.available)]))
 return <ProductDetail product={{...product,brand:product.btp_brands,variants:variants.map((v:any)=>({...v,available:map.get(v.id)===true}))}}/>
}
