import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export default async function SellerDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const user = verifyToken(token) as any;

  const seller = await pool.query(
    'SELECT id FROM sellers WHERE user_id = $1',
    [user.id]
  );

  if (seller.rows.length === 0) {
    redirect('/seller/register');
  }

  return (
    <>
      <h1>Dashboard Seller</h1>
      <p>Selamat datang, seller!</p>
    </>
  );
}
