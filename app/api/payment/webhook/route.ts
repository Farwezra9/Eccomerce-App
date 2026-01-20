// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const transactionStatus = payload.transaction_status;
    const orderId = payload.order_id; // ORDER-20-xxxx
    const transactionId = payload.transaction_id;

    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      const realOrderId = orderId.replace(/^ORDER-(\d+)-.*$/, '$1');

      // 1️⃣ Update payment
      await pool.query(`
        UPDATE payment
        SET status = 'paid',
            transaction_id = $1,
            paid_at = NOW()
        WHERE order_id = $2
      `, [transactionId, realOrderId]);

      // 2️⃣ Update order → masuk proses seller
      await pool.query(`
        UPDATE orders
        SET status = 'processing',
            updated_at = NOW()
        WHERE id = $1
      `, [realOrderId]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
