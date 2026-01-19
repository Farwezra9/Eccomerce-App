import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(req: Request, context: any) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const sellerRes = await pool.query('SELECT id FROM sellers WHERE user_id=$1', [user.id]);
    if (sellerRes.rows.length === 0) return NextResponse.json({ message: 'Not a seller' }, { status: 403 });

    const { params } = context;
    const { id } = await params;
    const { name, price, stock, description, category_id, status } = await req.json();

    // cek produk milik seller
    const prodRes = await pool.query(
      'SELECT * FROM products WHERE id=$1 AND seller_id=$2',
      [id, sellerRes.rows[0].id]
    );
    if (prodRes.rows.length === 0) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    await pool.query(
      `UPDATE products
       SET name=$1, price=$2, stock=$3, description=$4, category_id=$5, status=$6
       WHERE id=$7`,
      [name, price, stock, description, category_id, status, id]
    );

    return NextResponse.json({ message: 'Product updated' });
  } catch (err) {
    console.error('PUT /api/seller/products/:id error:', err);
    return NextResponse.json({ message: 'Gagal update produk' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const sellerRes = await pool.query('SELECT id FROM sellers WHERE user_id=$1', [user.id]);
    if (sellerRes.rows.length === 0) return NextResponse.json({ message: 'Not a seller' }, { status: 403 });

    const { params } = context;
    const { id } = await params;

    // cek produk milik seller
    const prodRes = await pool.query(
      'SELECT * FROM products WHERE id=$1 AND seller_id=$2',
      [id, sellerRes.rows[0].id]
    );
    if (prodRes.rows.length === 0) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    await pool.query('DELETE FROM products WHERE id=$1', [id]);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('DELETE /api/seller/products/:id error:', err);
    return NextResponse.json({ message: 'Gagal hapus produk' }, { status: 500 });
  }
}
