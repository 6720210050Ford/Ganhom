import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    facebook: Boolean(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET),
    line: Boolean(process.env.AUTH_LINE_ID && process.env.AUTH_LINE_SECRET),
  });
}
