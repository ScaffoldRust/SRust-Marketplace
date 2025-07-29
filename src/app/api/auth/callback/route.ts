import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard or original destination
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'
  return NextResponse.redirect(new URL(redirectTo, request.url))
}