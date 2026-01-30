import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromToken } from './lib/auth-helper'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // 1. Cek keberadaan token
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 2. Ambil role
  const userRole = getRoleFromToken(token)

  // 3. Jika token tidak valid
  if (!userRole) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // --- LOGIKA PROTEKSI ---

  // Admin Route: Tetap proteksi ketat lewat role
  if (pathname.startsWith('/admin')) {
    if (!['admin', 'superadmin'].includes(userRole)) {
      return NextResponse.rewrite(new URL('/404', request.url))
    }
  }

  // User & Seller Route: 
  // Karena role seller tetap 'user', kita hanya cek apakah dia login 
  // Pengecekan data seller di database dilakukan di SellerLayout.
  if (pathname.startsWith('/user') || pathname.startsWith('/seller')) {
    if (!['user', 'admin', 'superadmin'].includes(userRole)) {
      return NextResponse.rewrite(new URL('/404', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/seller/:path*'],
}