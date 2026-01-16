import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
   if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = verifyToken(token) as any;

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
