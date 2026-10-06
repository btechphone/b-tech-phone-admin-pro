import {createClient} from '@/lib/supabase/server'

export async function getProducts(){
  const s=await createClient()
  const {data,error}=await s.from('btp_products')
    .select('id,name,slug,category,short_description,description,image_url,gallery_urls,is_featured,btp_brands!inner(name,slug),btp_product_variants(id,sku,variant_name,color,storage,ram,price,compare_at_price)')
    .eq('is_active',true)
    .order('is_featured',{ascending:false})
    .order('name')
  if(error)throw error
  return (data||[]).map((p:any)=>({
    ...p,
    brand:Array.isArray(p.btp_brands)?p.btp_brands[0]:p.btp_brands,
    variants:p.btp_product_variants||[]
  }))
}

export async function getCatalog(){
  return {products:await getProducts()}
}
