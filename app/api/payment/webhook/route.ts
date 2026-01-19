import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import midtransClient from 'midtrans-client';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  const payload = await req.json();

  const transactionStatus = payload.transaction_status; // capture / settlement / pending
  const orderId = payload.order_id; // misal: ORDER-15-16783212
  const transactionId = payload.transaction_id;

  try {
    // Update payment table
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      const realOrderId = orderId.replace(/^ORDER-(\d+)-.*$/, '$1');
      await pool.query(`
        UPDATE payment
        SET status='paid', paid_at=NOW(), transaction_id=$1
        WHERE order_id=$2
      `, [transactionId, realOrderId]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
