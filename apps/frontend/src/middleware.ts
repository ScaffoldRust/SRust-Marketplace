import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/store/manage/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/auth/:path*',
  ],
}