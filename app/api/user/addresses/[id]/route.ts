import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function PUT(req: Request,context: any) {
  try {
     const { params } = context;
    const { id } = await params;
    if (!id) return NextResponse.json({ message: 'Address ID invalid' }, { status: 400 });
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      recipient_name,
      phone,
      address,
      city,
      postal_code,
    } = await req.json();

    const res = await pool.query(
      `UPDATE user_addresses
       SET recipient_name=$1, phone=$2, address=$3, city=$4, postal_code=$5
       WHERE id=$6 AND user_id=$7`,
      [
        recipient_name,
        phone,
        address,
        city,
        postal_code,
        id,
        user.id,
      ]
    );

    if (res.rowCount === 0) {
      return NextResponse.json(
        { message: 'Alamat tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Alamat diperbarui' });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: 'Gagal update alamat' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request,context: any) {
  try {
     const { params } = context;
    const { id } = await params;
    if (!id) return NextResponse.json({ message: 'Address ID invalid' }, { status: 400 });
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const res = await pool.query(
      'DELETE FROM user_addresses WHERE id=$1 AND user_id=$2',
      [id, user.id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json(
        { message: 'Alamat tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Alamat dihapus' });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: 'Gagal hapus alamat' },
      { status: 500 }
    );
  }
}
