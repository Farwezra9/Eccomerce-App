// app/api/user/order/payment/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  const { order_id, method } = await req.json();

  await pool.query(
    `INSERT INTO payment (order_id, method, status)
     VALUES ($1, $2, 'pending')`,
    [order_id, method]
  );

  return NextResponse.json({ message: "Metode pembayaran dipilih" });
}
