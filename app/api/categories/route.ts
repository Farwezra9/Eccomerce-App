import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM categories
      WHERE parent_id IS NULL
      ORDER BY name ASC
    `);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Error fetch categories:', err);
    return NextResponse.json(
      { message: 'Gagal mengambil kategori' },
      { status: 500 }
    );
  }
}
