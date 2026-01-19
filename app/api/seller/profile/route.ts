import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET() {
  const user = await getUserFromToken();
    
      if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

  const seller = await pool.query(
    `SELECT id, shop_name, shop_description
     FROM sellers
     WHERE user_id = $1`,
    [user.id]
  );

  if (seller.rows.length === 0) {
    return NextResponse.json({ message: 'Seller not found' }, { status: 404 });
  }

  return NextResponse.json(seller.rows[0]);
}
