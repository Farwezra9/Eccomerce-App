import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const user = await getUserFromToken();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const res = await pool.query(`
    SELECT
      p.order_id,
      p.method,
      p.amount,
      p.status,
      p.transaction_id,
      p.paid_at
    FROM payment p
    ORDER BY p.paid_at DESC NULLS LAST
  `);

  return NextResponse.json(res.rows);
}
