import { NextResponse } from 'next/server';
import { serialize } from 'cookie';


export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });

  response.headers.set(
    'Set-Cookie',
    serialize('token', '', {
      path: '/',
      expires: new Date(0),
    })
  );

  return response;
}
