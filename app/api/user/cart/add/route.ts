import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
 const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
   if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = verifyToken(token) as any;
  const { product_id, quantity } = await req.json();

  const product = await pool.query(
    "SELECT stock FROM products WHERE id = $1",
    [product_id]
  );

  if (product.rows.length === 0) {
    return NextResponse.json({ message: "Produk tidak ditemukan" }, { status: 404 });
  }

  const stock = product.rows[0].stock;

  await pool.query(
    `
    INSERT INTO carts (user_id, product_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, product_id)
    DO UPDATE
    SET quantity = LEAST(carts.quantity + EXCLUDED.quantity, $4),
        updated_at = NOW()
    `,
    [user.id, product_id, quantity, stock]
  );

  return NextResponse.json({ message: "Produk masuk keranjang" });
}
