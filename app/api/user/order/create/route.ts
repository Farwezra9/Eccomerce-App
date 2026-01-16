// app/api/user/order/create/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token) as any;
  const { product_id, quantity } = await req.json();

  // Ambil harga produk
  const res = await pool.query(`SELECT price FROM products WHERE id = $1`, [product_id]);
  if (res.rows.length === 0) return NextResponse.json({ message: "Product not found" }, { status: 404 });

  const price = res.rows[0].price;
  const total = price * quantity;

  // Buat order
  const orderRes = await pool.query(
    `INSERT INTO orders (user_id, total, status)
     VALUES ($1, $2, 'pending')
     RETURNING id`,
    [user.id, total]
  );

  const orderId = orderRes.rows[0].id;

  // Tambahkan order_items
  await pool.query(
    `INSERT INTO order_items (order_id, product_id, quantity, price)
     VALUES ($1, $2, $3, $4)`,
    [orderId, product_id, quantity, price]
  );

  return NextResponse.json({ order_id: orderId });
}
