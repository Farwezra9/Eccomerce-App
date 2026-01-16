// proxy.ts
import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
import { pool } from './lib/db';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('token')?.value;
  const user = token && (verifyToken(token) as any);

  // route khusus admin
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url));
    if (!['admin','superadmin'].includes(user.role)) return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  // route khusus user
  if (pathname.startsWith('/user')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url));
    if (user.role !== 'user') return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  // semua route /seller/*
  if (pathname.startsWith('/seller/')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url));

  // cek apakah user punya toko
  const seller = await pool.query(
    'SELECT id FROM sellers WHERE user_id = $1',
    [user.id]
  );
  if (seller.rows.length === 0) {
      return NextResponse.redirect(new URL('/user/register-seller', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/seller/:path*'],
};
