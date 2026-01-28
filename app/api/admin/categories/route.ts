import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

/* ======================
   GET – List Categories
   ====================== */
export async function GET() {
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const res = await pool.query(`
    SELECT
      c.id,
      c.name,
      c.parent_id,
      p.name AS parent_name
    FROM categories c
    LEFT JOIN categories p ON p.id = c.parent_id
    ORDER BY c.created_at DESC
  `);

  return NextResponse.json(res.rows);
}

/* ======================
   POST – Create Category with duplicate check
   ====================== */
export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { name, parent_id } = await req.json();

  // ✅ Cek apakah nama kategori sudah ada
  const check = await pool.query(
    'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
    [name.trim()]
  );

  if (check.rows.length > 0) {
    return NextResponse.json({ message: 'Kategori sudah ada' }, { status: 400 });
  }

  // Insert baru
  await pool.query(
    'INSERT INTO categories (name, parent_id) VALUES ($1, $2)',
    [name.trim(), parent_id || null]
  );

  return NextResponse.json({ success: true });
}
