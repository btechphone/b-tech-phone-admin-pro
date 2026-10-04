import {createClient} from '@/lib/supabase/server'
export async function getProducts(){
 const s=await createClient()
 const {data,error}=await s.from('btp_products').select('id,name,slug,category,short_description,description,image_url,gallery_urls,is_featured,btp_brands!inner(name,slug),btp_product_variants(id,sku,variant_name,color,storage,ram,price,compare_at_price,btp_inventory(stock_quantity,reserved_quantity))').eq('is_active',true).order('is_featured',{ascending:false}).order('name')
 if(error)throw error
 return data||[]
}