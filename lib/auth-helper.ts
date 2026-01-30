// lib/auth-helper.ts

export interface DecodedToken {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Mengambil role dari JWT token secara manual (Base64 Decode).
 * Aman digunakan di Middleware karena tidak bergantung pada modul Node.js.
 */
export function getRoleFromToken(token: string): string | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    // Decode Base64 ke String, lalu parse ke JSON
    const decoded: DecodedToken = JSON.parse(
      atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'))
    );

    return decoded.role || null;
  } catch (error) {
    return null;
  }
}