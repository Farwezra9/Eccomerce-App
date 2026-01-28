// ======================
// route.ts (API)
// ======================
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const res = await pool.query(`
    SELECT
      s.id,
      s.shop_name,
      s.rating,
      s.status,
      u.name AS owner_name,
      u.email
    FROM sellers s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.created_at DESC
  `);

  return NextResponse.json(res.rows);
}

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { seller_id, status } = await req.json();

  if (!['active', 'inactive', 'suspended'].includes(status)) {
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  }

  await pool.query(
    `UPDATE sellers
     SET status = $1, updated_at = NOW()
     WHERE id = $2`,
    [status, seller_id]
  );

  return NextResponse.json({ success: true });
}
