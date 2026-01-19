import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.json();

  // real case: validasi signature gateway
  if (body.transaction_status !== 'settlement') {
    return NextResponse.json({ message: 'Ignored' });
  }

  const orderId = body.order_id;

  await pool.query(
    `
    UPDATE payment
    SET status='paid', paid_at=NOW()
    WHERE order_id=$1
    `,
    [orderId]
  );

  await pool.query(
    `
    UPDATE orders
    SET status='paid'
    WHERE id=$1
    `,
    [orderId]
  );

  return NextResponse.json({ message: 'OK' });
}
