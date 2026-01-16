// app/api/user/order/shipping/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  const { order_id, courier_name } = await req.json();

  await pool.query(
    `INSERT INTO shipping (order_id, courier_name, status)
     VALUES ($1, $2, 'pending')`,
    [order_id, courier_name]
  );

  return NextResponse.json({ message: "Kurir dipilih" });
}
