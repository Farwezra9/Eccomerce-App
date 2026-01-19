// app/api/payment/midtrans/route.ts
import { NextResponse } from 'next/server';
// @ts-ignore
import midtransClient from 'midtrans-client';
import { pool } from '@/lib/db'; // koneksi Postgres

export async function POST(req: Request) {
  const { order_id, gross_amount } = await req.json();

  // 1️⃣ Inisialisasi Snap
  const snap = new midtransClient.Snap({
    isProduction: false, // sandbox mode
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
  });

  // 2️⃣ Parameter transaksi
  const parameter = {
    transaction_details: {
      order_id: `ORDER-${order_id}-${Date.now()}`, // unik
      gross_amount,
    },
    customer_details: {
      first_name: 'Customer',
      email: 'customer@example.com',
      phone: '+6281111111111',
    },
    credit_card: { secure: true },
  };

  // 3️⃣ Buat transaksi
  const transaction = await snap.createTransaction(parameter);

  // 4️⃣ Kirim snapToken ke frontend
  return NextResponse.json({ snapToken: transaction.token });
}
