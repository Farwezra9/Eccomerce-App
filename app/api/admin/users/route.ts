import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const user = await getUserFromToken();
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const res = await pool.query(
    'SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC'
  );
  return NextResponse.json(res.rows);
}

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { user_id, status } = await req.json();

  if (!['active', 'inactive', 'suspended'].includes(status)) {
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  }

  await pool.query(
    'UPDATE users SET status=$1, updated_at=NOW() WHERE id=$2',
    [status, user_id]
  );

  return NextResponse.json({ success: true });
}
