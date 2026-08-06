import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));

  response.cookies.set('session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
