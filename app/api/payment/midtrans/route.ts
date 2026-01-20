import { NextResponse } from 'next/server';
// @ts-ignore
import midtransClient from 'midtrans-client';
import { pool } from '@/lib/db';

export async function POST(req: Request) {
  const { order_id } = await req.json();

  /* =========================
     1️⃣ Ambil ORDER + PAYMENT + USER
  ========================= */
  const res = await pool.query(`
    SELECT
      o.id,
      o.total,
      p.method,
      u.name,
      u.email,
      u.phone
    FROM orders o
    JOIN payment p ON p.order_id = o.id
    JOIN users u ON u.id = o.user_id
    WHERE o.id = $1
  `, [order_id]);

  const order = res.rows[0];
  if (!order) {
    return NextResponse.json(
      { message: 'Order tidak ditemukan' },
      { status: 404 }
    );
  }

  /* =========================
     2️⃣ LOCK METODE PEMBAYARAN
     (sesuai pilihan di checkout)
  ========================= */
  const paymentMap: Record<string, string[]> = {
    bca_va: ['bca_va'],
    bni_va: ['bni_va'],
    bri_va: ['bri_va'],
    permata_va: ['permata_va'],
    qris: ['qris'],
    gopay: ['gopay'],
  };

  const enabledPayments = paymentMap[order.method];
  if (!enabledPayments) {
    return NextResponse.json(
      { message: 'Metode pembayaran tidak valid' },
      { status: 400 }
    );
  }

  /* =========================
     3️⃣ Inisialisasi Midtrans Snap
  ========================= */
  const snap = new midtransClient.Snap({
    isProduction: false, // sandbox
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
  });

  /* =========================
     4️⃣ Buat Transaksi (LOCKED)
     + EMAIL REAL (FIX DASHBOARD "-")
  ========================= */
  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id: `ORDER-${order.id}-${Date.now()}`,
      gross_amount: Number(order.total),
    },
    enabled_payments: enabledPayments,
    customer_details: {
      first_name: order.name,
      email: order.email,       // ✅ INI YANG BIKIN DASHBOARD TIDAK KOSONG
      phone: order.phone || '',
    },
  });

  return NextResponse.json({
    snapToken: transaction.token,
  });
}
