import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Login page is always accessible
  if (pathname === '/admin/login') return NextResponse.next()

  const token = request.cookies.get('nb-admin-token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
