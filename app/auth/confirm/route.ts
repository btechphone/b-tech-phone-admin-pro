import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone()
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/auth/login?error=confirmation_invalid', request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ token_hash, type })

  if (error) {
    const target = new URL('/auth/login', request.url)
    target.searchParams.set('error', 'confirmation_failed')
    return NextResponse.redirect(target)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const metadata = user.user_metadata ?? {}
    const { error: customerError } = await supabase.from('btp_customers').upsert({
      auth_user_id: user.id,
      full_name: metadata.full_name ?? '',
      phone: metadata.phone ?? ''
    }, { onConflict: 'auth_user_id' })

    if (customerError) {
      const target = new URL('/auth/login', request.url)
      target.searchParams.set('error', 'customer_profile_failed')
      return NextResponse.redirect(target)
    }
  }

  return NextResponse.redirect(new URL('/produk', request.url))
}
