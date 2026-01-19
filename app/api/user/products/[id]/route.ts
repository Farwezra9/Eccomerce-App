import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request, context: any) {
  const { params } = context;
  const { id } = await params;

  const result = await pool.query(
    `SELECT p.id AS product_id, 
     p.name AS product_name,
     p.*, s.shop_name
     FROM products p
     JOIN sellers s ON p.seller_id = s.id
     WHERE p.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}
