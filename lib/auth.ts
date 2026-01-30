import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface UserToken extends JwtPayload {
  id: number;
  email: string;
  role: 'superadmin' | 'admin' | 'seller' | 'user';
}

/** buat JWT token */
export const signToken = (payload: UserToken) =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' });

/** verifikasi JWT token */
export const verifyToken = (token: string): UserToken | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as UserToken;
  } catch {
    return null;
  }
};

/** ambil user dari cookie token */
export async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const user = verifyToken(token);
  if (!user) return null;

  return user;
}
