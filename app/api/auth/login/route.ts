// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';
import cookie from 'cookie';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
  }

  const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const user = result.rows[0];
  if (!user) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  // Buat token
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  const response = NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  response.headers.set(
    'Set-Cookie',
    cookie.serialize('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  );

  return response;
}
