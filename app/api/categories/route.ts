// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  const res = await pool.query('SELECT id, name FROM categories ORDER BY name ASC');
  return NextResponse.json(res.rows);
}
