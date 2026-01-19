import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
const user = await getUserFromToken();
if (!user) {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

  const result = await pool.query(`
    SELECT
      c.id            AS cart_id,
      p.id            AS product_id,
      p.name          AS product_name,
      p.price,
      c.quantity,
      (p.price * c.quantity) AS subtotal
    FROM carts c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
  `, [user.id]);

  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
const user = await getUserFromToken();
if (!user) {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

  const { product_id, quantity } = await req.json();

  // Cek stok produk
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
