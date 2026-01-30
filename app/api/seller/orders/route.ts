import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  // 1. Ambil ID Seller
  const sellerRes = await pool.query('SELECT id FROM sellers WHERE user_id=$1', [user.id]);
  if (sellerRes.rows.length === 0) return NextResponse.json({ message: 'Not a seller' }, { status: 403 });

  const sellerId = sellerRes.rows[0].id;

  try {
    // 2. Ambil semua Order yang berisi produk milik seller ini
    // Kita pakai DISTINCT agar order_id tidak duplikat di tahap ini
    const ordersRes = await pool.query(
      `
      SELECT DISTINCT
        o.id,
        o.total,
        o.status,
        o.created_at,
        u.name AS buyer_name,
        sa.recipient_name,
        sa.phone AS recipient_phone,
        sa.address,
        sa.city,
        sa.postal_code,
        s.courier_name,
        s.tracking_number
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      LEFT JOIN shipping_addresses sa ON sa.id = o.shipping_id
      LEFT JOIN shipping s ON s.order_id = o.id
      WHERE p.seller_id = $1
        AND o.status IN ('processing','packed','shipped')
      ORDER BY o.created_at DESC
      `,
      [sellerId]
    );

    const orders = ordersRes.rows;

    // 3. Jika tidak ada order, langsung balikkan array kosong
    if (orders.length === 0) return NextResponse.json([]);

    // 4. Ambil SEMUA item untuk order-order di atas yang milik seller ini saja
    const orderIds = orders.map(o => o.id);
    const itemsRes = await pool.query(
      `
      SELECT 
        oi.order_id, 
        oi.quantity, 
        oi.price, 
        p.name AS product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ANY($1) AND p.seller_id = $2
      `,
      [orderIds, sellerId]
    );

    const allItems = itemsRes.rows;

    // 5. Gabungkan items ke dalam masing-masing order (Sama seperti logika detail order kamu)
    const finalOrders = orders.map(order => {
      return {
        ...order,
        items: allItems.filter(item => item.order_id === order.id)
      };
    });

    return NextResponse.json(finalOrders);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Gagal mengambil data' }, { status: 500 });
  }
}

// POST tetap sama
export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { order_id, status, tracking_number } = await req.json();
  const allowedStatus = ['packed', 'shipped'];
  if (!allowedStatus.includes(status)) return NextResponse.json({ message: 'Status invalid' }, { status: 400 });

  await pool.query('UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2', [status, order_id]);

  if (status === 'shipped') {
    await pool.query(
      `UPDATE shipping SET tracking_number=$1, status='shipped', shipped_at=NOW() WHERE order_id=$2`,
      [tracking_number, order_id]
    );
  }

  return NextResponse.json({ success: true });
}