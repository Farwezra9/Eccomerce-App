import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { pool } from "@/lib/db";

export async function DELETE(req: Request,context: any) {
const user = await getUserFromToken();
if (!user) {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}
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
