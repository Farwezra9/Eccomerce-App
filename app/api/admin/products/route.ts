import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

/* ======================
   GET – List All Products
   ====================== */
export async function GET() {
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const res = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.price,
      p.status,
      s.shop_name
    FROM products p
    JOIN sellers s ON s.id = p.seller_id
    ORDER BY p.created_at DESC
  `);

  return NextResponse.json(res.rows);
}

/* ======================
   POST – Update Status
   ====================== */
export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { product_id, status } = await req.json();

  if (!['active', 'inactive'].includes(status)) {
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  }

  await pool.query(
    `UPDATE products SET status=$1, updated_at=NOW() WHERE id=$2`,
    [status, product_id]
  );

  return NextResponse.json({ success: true });
}
