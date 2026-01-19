import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: Request, context: any) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 🔹 Perbaikan: params.id sekarang dari context.params.id
    const orderId = context.params.id;

    // Cek order
    const order = await pool.query(
      `SELECT * FROM orders WHERE id=$1 AND user_id=$2`,
      [orderId, user.id]
    );

    if (order.rowCount === 0) {
      return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 });
    }

    // Buat payment record jika belum ada
    await pool.query(
      `
      INSERT INTO payment(order_id, method, status)
      VALUES ($1, 'bank_transfer', 'pending')
      ON CONFLICT (order_id) DO NOTHING
      `,
      [orderId]
    );

    // Simulasi URL gateway
    return NextResponse.json({
      payment_url: `https://payment-gateway.test/pay?order_id=${orderId}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Payment error' }, { status: 500 });
  }
}
