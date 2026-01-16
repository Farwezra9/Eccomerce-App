import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const user: any = verifyToken(token);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { product_id, quantity, shipping, courier, payment_method } = await req.json();

    // Ambil data produk
    const prodRes = await pool.query('SELECT * FROM products WHERE id=$1', [product_id]);
    const product = prodRes.rows[0];
    if (!product) return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
    if (product.stock < quantity) return NextResponse.json({ message: 'Stock tidak cukup' }, { status: 400 });

    let shipping_id = null;

    // Jika pilih alamat baru
    if (!shipping.id) {
      const shipRes = await pool.query(
        'INSERT INTO shipping_addresses(user_id, recipient_name, phone, address, city, postal_code) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
        [user.id, shipping.recipient_name, shipping.phone, shipping.address, shipping.city, shipping.postal_code]
      );
      shipping_id = shipRes.rows[0].id;
    } else {
      shipping_id = shipping.id;
    }

    // Buat order
    const orderRes = await pool.query(
      'INSERT INTO orders(user_id, total, shipping_id) VALUES($1,$2,$3) RETURNING id',
      [user.id, product.price * quantity, shipping_id]
    );
    const order_id = orderRes.rows[0].id;

    // Buat order item
    await pool.query(
      'INSERT INTO order_items(order_id, product_id, quantity, price) VALUES($1,$2,$3,$4)',
      [order_id, product.id, quantity, product.price]
    );

    // Buat payment
    await pool.query(
      'INSERT INTO payment(order_id, method, status) VALUES($1,$2,$3)',
      [order_id, payment_method, 'pending']
    );

    // Buat shipping/logistic
    await pool.query(
      'INSERT INTO shipping(order_id, courier_name, status) VALUES($1,$2,$3)',
      [order_id, courier, 'pending']
    );

    // Kurangi stock produk
    await pool.query('UPDATE products SET stock = stock - $1 WHERE id=$2', [quantity, product.id]);

    return NextResponse.json({ message: 'Checkout sukses', order_id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Checkout gagal' }, { status: 500 });
  }
}
