// lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { NextApiRequest } from 'next';
import { pool } from './db';

/** hash password */
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

/** verifikasi password */
export const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

/** buat JWT token */
export const signToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' });
};

/** verifikasi JWT token */
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    return null;
  }
};
