import { NextResponse } from "next/server";
import { getUserFromToken } from '@/lib/auth';
import { pool } from "@/lib/db";

export async function GET() {
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
