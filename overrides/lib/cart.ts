export type CartItem={variantId:string;productId:string;productName:string;variantName:string;sku?:string|null;price:number;imageUrl?:string|null;quantity:number}
const KEY='btp-cart-v1'
export function getCart():CartItem[]{if(typeof window==='undefined')return[];try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
export function saveCart(items:CartItem[]){if(typeof window!=='undefined')localStorage.setItem(KEY,JSON.stringify(items));return items}
export function addToCart(item:CartItem){const items=getCart();const i=items.findIndex(x=>x.variantId===item.variantId);if(i>=0)items[i]={...items[i],quantity:items[i].quantity+item.quantity};else items.push(item);saveCart(items);return items}
export function updateCart(variantId:string,quantity:number){const items=getCart().map(x=>x.variantId===variantId?{...x,quantity}:x).filter(x=>x.quantity>0);return saveCart(items)}
export function removeFromCart(variantId:string){return saveCart(getCart().filter(x=>x.variantId!==variantId))}
export function clearCart(){return saveCart([])}
export function cartTotal(items=getCart()){return items.reduce((s,x)=>s+x.price*x.quantity,0)}

export function cartCount(items=getCart()){return items.reduce((s,x)=>s+x.quantity,0)}
