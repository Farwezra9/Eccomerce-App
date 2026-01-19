import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ambil data user
    const userRes = await pool.query(
      `SELECT id, name, email, role, phone, created_at
       FROM users
       WHERE id = $1`,
      [user.id]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // ambil alamat pengiriman user
    const addressRes = await pool.query(
      `SELECT
        id,
        recipient_name,
        phone,
        address,
        city,
        postal_code
       FROM user_addresses
       WHERE user_id = $1
       ORDER BY id DESC`,
      [user.id]
    );

    return NextResponse.json({
      ...userRes.rows[0],
      addresses: addressRes.rows,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: 'Gagal mengambil profil' },
      { status: 500 }
    );
  }
}
