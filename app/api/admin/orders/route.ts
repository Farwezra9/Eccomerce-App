import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

/* GET – List Orders dengan filter opsional */
export async function GET(req: Request) {
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get('status') || '';
  const paymentFilter = url.searchParams.get('payment') || '';

  const params: any[] = [];
  let query = `
    SELECT
      o.id,
      u.name AS buyer,
      s.shop_name,
      o.total,
      o.status AS order_status,
      COALESCE(p.status,'pending') AS payment_status,
      o.created_at
    FROM orders o
    JOIN users u ON u.id = o.user_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products pr ON pr.id = oi.product_id
    LEFT JOIN sellers s ON s.id = pr.seller_id
    LEFT JOIN payment p ON p.order_id = o.id
    WHERE 1=1
  `;

  if (statusFilter) {
    params.push(statusFilter);
    query += ` AND o.status=$${params.length}`;
  }

  if (paymentFilter) {
    params.push(paymentFilter);
    query += ` AND COALESCE(p.status,'pending')=$${params.length}`;
  }

  query += ` GROUP BY o.id, u.name, s.shop_name, o.total, o.status, p.status, o.created_at`;
  query += ' ORDER BY o.created_at DESC';

  const res = await pool.query(query, params);
  return NextResponse.json(res.rows);
}
  
