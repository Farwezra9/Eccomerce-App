import { NextResponse } from 'next/server';
import { verifyToken } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // Ambil token dari cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const token = cookieHeader.split('; ').find(c => c.startsWith('token='))?.split('=')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const user: any = verifyToken(token);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Ambil semua alamat user
    const res = await pool.query(
      'SELECT * FROM shipping_addresses WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );

    return NextResponse.json(res.rows);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Gagal mengambil alamat' }, { status: 500 });
  }
}
