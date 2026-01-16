import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = verifyToken(token) as any;

  // Cek apakah sudah seller
  const sellerCheck = await pool.query(
    'SELECT id FROM sellers WHERE user_id=$1',
    [user.id]
  );

  if (sellerCheck.rows.length > 0) {
    return NextResponse.json(
      { message: 'Already a seller' },
      { status: 400 }
    );
  }

  const { shop_name, shop_description } = await req.json();

  if (!shop_name) {
    return NextResponse.json(
      { message: 'Shop name required' },
      { status: 400 }
    );
  }

  await pool.query(
    `
    INSERT INTO sellers (user_id, shop_name, shop_description)
    VALUES ($1,$2,$3)
    `,
    [user.id, shop_name, shop_description]
  );

  return NextResponse.json({ message: 'Seller created' });
}
