// lib/seller-service.ts
import { pool } from '@/lib/db';

export async function checkSeller(userId: number) {
  const res = await pool.query('SELECT id FROM sellers WHERE user_id = $1', [userId]);
  return res.rows.length > 0;
}