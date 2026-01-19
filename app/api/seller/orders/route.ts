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

  if (sellerRes.rows.length === 0) {
    return NextResponse.json({ message: 'Not a seller' }, { status: 403 });
  }

  const orders = await pool.query(
    `
    SELECT
      o.id,
      o.status,
      o.total,
      o.created_at
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE p.seller_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
    `,
    [sellerRes.rows[0].id]
  );

  return NextResponse.json(orders.rows);
}
