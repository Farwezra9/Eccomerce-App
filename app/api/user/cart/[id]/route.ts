import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { pool } from "@/lib/db";

// --- FUNGSI DELETE (Sudah Benar) ---
export async function DELETE(req: Request, context: any) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { params } = context;
  const { id } = await params;
  
  if (!id) return NextResponse.json({ message: 'Cart ID tidak valid' }, { status: 400 });

  const result = await pool.query(
    'DELETE FROM carts WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, user.id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ message: 'Item cart tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Item berhasil dihapus', cart_id: id });
}

// --- FUNGSI PUT (PERBAIKAN) ---
export async function PUT(req: Request, context: any) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { params } = context;
    const { id } = await params; // Pastikan di-await
    const { quantity } = await req.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Quantity tidak valid" }, { status: 400 });
    }

    // Gunakan pool.query karena kamu pakai SQL mentah/Postgres
    const result = await pool.query(
      'UPDATE carts SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, id, user.id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Item cart tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Quantity updated", 
      data: result.rows[0] 
    }, { status: 200 });

  } catch (error) {
    console.error('Update Cart Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}