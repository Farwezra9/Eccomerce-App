import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { serialize } from 'cookie';
import bcrypt from 'bcrypt'; 

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });
    }

    // Lakukan verifikasi password langsung di sini
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });
    }

    // Buat token menggunakan fungsi dari lib/auth
    const token = signToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Set Cookie
    response.headers.set(
      'Set-Cookie',
      serialize('token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 hari
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}