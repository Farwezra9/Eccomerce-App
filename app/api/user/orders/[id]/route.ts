import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { pool } from "@/lib/db";

export async function GET(req: Request, context: any) {
  try {
    // ✅ unwrap params karena di App Router baru ini bisa Promise
    const params = await context.params; 
    const orderId = Number(params.id);
    if (!orderId) return NextResponse.json({ message: 'Order ID invalid' }, { status: 400 });

    const user = await getUserFromToken();
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Ambil order
    const orderRes = await pool.query(
      `SELECT 
         o.id AS order_id,
         o.total,
         o.status AS order_status,
         o.created_at,
         sa.recipient_name,
         sa.phone AS recipient_phone,
         sa.address,
         sa.city,
         sa.postal_code,
         p.method AS payment_method,
         p.status AS payment_status,
         s.courier_name,
         s.status AS shipping_status,
         s.tracking_number
       FROM orders o
       JOIN shipping_addresses sa ON o.shipping_id = sa.id
       LEFT JOIN payment p ON o.id = p.order_id
       LEFT JOIN shipping s ON o.id = s.order_id
       WHERE o.user_id = $1 AND o.id = $2`,
      [user.id, orderId]
    );

    const order = orderRes.rows[0];
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    // Ambil item
    const itemsRes = await pool.query(
      `SELECT oi.id, oi.product_id, oi.quantity, oi.price, pr.name AS product_name
       FROM order_items oi
       JOIN products pr ON oi.product_id = pr.id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    order.items = itemsRes.rows;

    return NextResponse.json(order);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Gagal mengambil order' }, { status: 500 });
  }
}
