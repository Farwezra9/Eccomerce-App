import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { pool } from "@/lib/db";

export async function GET(req: Request, context: any) {
  try {
    // Unwrap params
    const params = await context.params;
    const productId = Number(params.id);
    if (!productId) return NextResponse.json({ message: 'Product ID invalid' }, { status: 400 });

    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    // Ambil detail produk beserta seller dan gambar utama
    const res = await pool.query(
      `SELECT 
         p.id AS product_id,
         p.name AS product_name,
         p.description,
         p.price,
         p.stock,
         s.shop_name,
         s.id AS seller_id,
         pi.image_url AS primary_image
       FROM products p
       JOIN sellers s ON p.seller_id = s.id
       LEFT JOIN product_images pi 
         ON pi.product_id = p.id AND pi.is_primary = TRUE
       WHERE p.id = $1`,
      [productId]
    );

    const product = res.rows[0];
    if (!product) return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });

    return NextResponse.json(product);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Gagal mengambil produk' }, { status: 500 });
  }
}
