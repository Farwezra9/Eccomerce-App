import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  const res = await pool.query(`
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      p.price,
      p.stock,
      s.shop_name,
      pi.image_url AS primary_image
    FROM products p
    JOIN sellers s ON s.id = p.seller_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    WHERE p.status='active'
  `);

  return NextResponse.json(res.rows);
}
