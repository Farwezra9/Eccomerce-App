import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET() {
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const res = await pool.query(
    `SELECT id, recipient_name, phone, address, city, postal_code
     FROM user_addresses
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [user.id]
  );

  return NextResponse.json(res.rows);
}

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const countRes = await pool.query(
    'SELECT COUNT(*) FROM user_addresses WHERE user_id = $1',
    [user.id]
  );

  if (Number(countRes.rows[0].count) >= 2) {
    return NextResponse.json(
      { message: 'Maksimal 2 alamat' },
      { status: 400 }
    );
  }

  const {
    recipient_name,
    phone,
    address,
    city,
    postal_code,
  } = await req.json();

  await pool.query(
    `INSERT INTO user_addresses
     (user_id, recipient_name, phone, address, city, postal_code)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [user.id, recipient_name, phone, address, city, postal_code]
  );

  return NextResponse.json({ message: 'Alamat ditambahkan' });
}
