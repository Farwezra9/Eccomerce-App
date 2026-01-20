import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { pool } from '@/lib/db';

const SHIPPING_COST: Record<string, number> = {
  jne: 10000,
  sicepat: 9000,
  pos: 8000
};

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { product_id, quantity, shipping, courier, payment_method } =
      await req.json();

    /* === PRODUK === */
    const prodRes = await pool.query(
      'SELECT id, price, stock FROM products WHERE id=$1',
      [product_id]
    );
    const product = prodRes.rows[0];

    if (!product) {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ message: 'Stock tidak cukup' }, { status: 400 });
    }

    const shippingCost = SHIPPING_COST[courier];
    if (!shippingCost) {
      return NextResponse.json({ message: 'Kurir tidak valid' }, { status: 400 });
    }

    const subtotal = product.price * quantity;
    const total = subtotal + shippingCost;

    /* === USER ADDRESS === */
    let userAddressId: number;

    if (!shipping.id) {
      const addr = await pool.query(
        `INSERT INTO user_addresses
         (user_id, recipient_name, phone, address, city, postal_code)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        [
          user.id,
          shipping.recipient_name,
          shipping.phone,
          shipping.address,
          shipping.city,
          shipping.postal_code
        ]
      );
      userAddressId = addr.rows[0].id;
    } else {
      userAddressId = shipping.id;
    }

    const shipSnap = await pool.query(
      `INSERT INTO shipping_addresses
       (user_id, recipient_name, phone, address, city, postal_code)
       SELECT user_id, recipient_name, phone, address, city, postal_code
       FROM user_addresses WHERE id=$1
       RETURNING id`,
      [userAddressId]
    );

    const shipping_id = shipSnap.rows[0].id;

    /* === ORDER === */
    const orderRes = await pool.query(
      `INSERT INTO orders (user_id, total, status, shipping_id)
       VALUES ($1,$2,'pending',$3)
       RETURNING id`,
      [user.id, total, shipping_id]
    );
    const order_id = orderRes.rows[0].id;

    /* === ORDER ITEM === */
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES ($1,$2,$3,$4)`,
      [order_id, product_id, quantity, product.price]
    );

    /* === PAYMENT === */
    await pool.query(
      `INSERT INTO payment (order_id, method, amount, status)
       VALUES ($1,$2,$3,'pending')`,
      [order_id, payment_method, total]
    );

    /* === SHIPPING === */
    await pool.query(
      `INSERT INTO shipping (order_id, courier_name, status)
       VALUES ($1,$2,'pending')`,
      [order_id, courier]
    );

    /* === STOCK === */
    await pool.query(
      'UPDATE products SET stock = stock - $1 WHERE id=$2',
      [quantity, product_id]
    );

    /* === CART === */
    await pool.query(
      'DELETE FROM carts WHERE user_id=$1 AND product_id=$2',
      [user.id, product_id]
    );

    return NextResponse.json({
      message: 'Checkout berhasil',
      order_id,
      subtotal,
      shippingCost,
      total
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Checkout gagal' }, { status: 500 });
  }
}
