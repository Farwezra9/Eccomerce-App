// app/api/seller/check/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const user = await getUserFromToken();
  
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  const sellerRes = await pool.query(
    'SELECT id FROM sellers WHERE user_id=$1',
    [user.id]
  );

  return NextResponse.json({ exists: sellerRes.rows.length > 0 });
}
