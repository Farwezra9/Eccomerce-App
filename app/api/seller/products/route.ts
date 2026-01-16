import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token) as any;
}

/* =====================
   GET products seller
===================== */
export async function GET() {
  const user = await getUserFromToken();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const sellerRes = await pool.query(
    'SELECT id FROM sellers WHERE user_id=$1',
    [user.id]
  );

  if (sellerRes.rows.length === 0) {
    return NextResponse.json({ message: 'Not a seller' }, { status: 403 });
  }

  const products = await pool.query(
    `
    SELECT p.*, c.name AS category_name
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.seller_id=$1
ORDER BY p.created_at DESC;

    `,
    [sellerRes.rows[0].id]
  );

  return NextResponse.json(products.rows);
}

/* =====================
   POST create product
===================== */
export async function POST(req: Request) {
  const user = await getUserFromToken();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const sellerRes = await pool.query(
    'SELECT id FROM sellers WHERE user_id=$1',
    [user.id]
  );

  if (sellerRes.rows.length === 0) {
    return NextResponse.json({ message: 'Not a seller' }, { status: 403 });
  }

  const { name, price, stock, description, category_id } = await req.json();

  if (!name || !price || !stock) {
    return NextResponse.json(
      { message: 'Missing fields' },
      { status: 400 }
    );
  }

  await pool.query(
    `
    INSERT INTO products
    (seller_id, category_id, name, description, price, stock)
    VALUES ($1,$2,$3,$4,$5,$6)
    `,
    [
      sellerRes.rows[0].id,
      category_id,
      name,
      description,
      price,
      stock,
    ]
  );

  return NextResponse.json({ message: 'Product created' });
}
