// app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const user = await getUserFromToken();
  if (!user || !['admin','superadmin'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const total_users = (await pool.query('SELECT COUNT(*) FROM users')).rows[0].count;
  const total_sellers = (await pool.query('SELECT COUNT(*) FROM sellers')).rows[0].count;
  const total_orders = (await pool.query('SELECT COUNT(*) FROM orders')).rows[0].count;
  const total_revenue = (await pool.query('SELECT COALESCE(SUM(amount),0) AS sum FROM payment WHERE status=$1', ['paid'])).rows[0].sum;

  return NextResponse.json({ total_users, total_sellers, total_orders, total_revenue });
}
