import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function POST(req: Request,context: any) {
  const { id } = await context.params;
  const orderId = Number(id);

  if (!orderId) {
    return NextResponse.json({ message: 'Order ID tidak valid' }, { status: 400 });
  }

  const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

  // Ambil order
  const orderRes = await pool.query(
    'SELECT * FROM orders WHERE id=$1 AND user_id=$2',
    [orderId, user.id]
  );

  if (orderRes.rows.length === 0) {
    return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 });
  }

  const order = orderRes.rows[0];

  if (order.status !== 'pending') {
    return NextResponse.json(
      { message: 'Order tidak bisa dibatalkan' },
      { status: 400 }
    );
  }

  // Ambil order items (buat balikin stok)
  const itemsRes = await pool.query(
    'SELECT product_id, quantity FROM order_items WHERE order_id=$1',
    [orderId]
  );

  // Balikin stok
  for (const item of itemsRes.rows) {
    await pool.query(
      'UPDATE products SET stock = stock + $1 WHERE id=$2',
      [item.quantity, item.product_id]
    );
  }

  // Update status order
  await pool.query(
    "UPDATE orders SET status='cancelled' WHERE id=$1",
    [orderId]
  );

  // Update payment
  await pool.query(
    "UPDATE payment SET status='cancelled' WHERE order_id=$1",
    [orderId]
  );

  // Update shipping
  await pool.query(
    "UPDATE shipping SET status='cancelled' WHERE order_id=$1",
    [orderId]
  );

  return NextResponse.json({ message: 'Order berhasil dibatalkan' });
}
