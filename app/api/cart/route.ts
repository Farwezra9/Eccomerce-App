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

  await pool.query(`
    INSERT INTO carts (user_id, product_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, product_id)
    DO UPDATE 
      SET quantity = carts.quantity + EXCLUDED.quantity
  `, [user.id, product_id, quantity || 1]);

  return NextResponse.json({ message: "Produk masuk keranjang" });
}
