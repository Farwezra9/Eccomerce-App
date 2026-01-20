import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET - Ambil pesanan masuk seller
 */
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

  const sellerId = sellerRes.rows[0].id;

  const ordersRes = await pool.query(
    `
    SELECT
      o.id,
      o.total,
      o.status,
      o.created_at,
      u.name AS buyer_name,
      s.courier_name,
      s.tracking_number,
      COUNT(oi.id)::int AS total_items
    FROM orders o
    JOIN users u ON u.id = o.user_id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    LEFT JOIN shipping s ON s.order_id = o.id
    WHERE p.seller_id = $1
      AND o.status IN ('processing','packed','shipped')
    GROUP BY o.id, u.name, s.courier_name, s.tracking_number
    ORDER BY o.created_at DESC
    `,
    [sellerId]
  );

  return NextResponse.json(ordersRes.rows);
}

/**
 * POST - Update status + input resi
 */
export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { order_id, status, tracking_number } = await req.json();

  const allowedStatus = ['packed', 'shipped'];
  if (!allowedStatus.includes(status)) {
    return NextResponse.json({ message: 'Status tidak valid' }, { status: 400 });
  }

  const sellerRes = await pool.query(
    'SELECT id FROM sellers WHERE user_id=$1',
    [user.id]
  );

  if (sellerRes.rows.length === 0) {
    return NextResponse.json({ message: 'Not seller' }, { status: 403 });
  }

  if (status === 'shipped' && !tracking_number) {
    return NextResponse.json(
      { message: 'Nomor resi wajib diisi' },
      { status: 400 }
    );
  }

  await pool.query(
    `
    UPDATE orders
    SET status=$1, updated_at=NOW()
    WHERE id=$2
    `,
    [status, order_id]
  );

  if (status === 'shipped') {
    await pool.query(
      `
      UPDATE shipping
      SET tracking_number=$1,
          status='shipped',
          shipped_at=NOW()
      WHERE order_id=$2
      `,
      [tracking_number, order_id]
    );
  }

  return NextResponse.json({ success: true });
}
