import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request, context: any) {
  const { params } = context;
  const { id } = await params;

  try {
    const query = `
      WITH RECURSIVE category_path AS (
          -- Ambil kategori langsung dari produk
          SELECT c.id, c.name, c.parent_id, 1 as level
          FROM categories c
          JOIN products p ON p.category_id = c.id
          WHERE p.id = $1

          UNION ALL

          -- Naik ke parent secara rekursif
          SELECT c.id, c.name, c.parent_id, cp.level + 1
          FROM categories c
          JOIN category_path cp ON c.id = cp.parent_id
      )
      SELECT 
          p.id AS product_id, 
          p.name AS product_name,
          p.*, 
          s.shop_name,
          -- Gabungkan kategori menjadi array JSON, diurutkan dari level tertinggi (induk) ke terendah
          (SELECT json_agg(cp ORDER BY cp.level DESC) FROM category_path cp) as breadcrumbs
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.id = $1;
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}