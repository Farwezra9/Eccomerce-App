// app/api/seller/check/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return NextResponse.json({ exists: false });

  const user = verifyToken(token) as any;
  const sellerRes = await pool.query(
    'SELECT id FROM sellers WHERE user_id=$1',
    [user.id]
  );

  return NextResponse.json({ exists: sellerRes.rows.length > 0 });
}
