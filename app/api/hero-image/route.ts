import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const banner1 = 'C:\\Users\\MSIWorrapon\\.gemini\\antigravity-ide\\brain\\65396d51-45af-485f-bc27-11035766c75f\\.user_uploaded\\media_1788936697783.png';
  const banner2 = 'C:\\Users\\MSIWorrapon\\.gemini\\antigravity-ide\\brain\\65396d51-45af-485f-bc27-11035766c75f\\.user_uploaded\\media_1788937031560.png';
  const banner3 = 'C:\\Users\\MSIWorrapon\\.gemini\\antigravity-ide\\brain\\590b1a69-0970-48d3-a6fe-68a4814addab\\.user_uploaded\\media_1788960805139.png';
  const banner4 = 'C:\\Users\\MSIWorrapon\\.gemini\\antigravity-ide\\brain\\590b1a69-0970-48d3-a6fe-68a4814addab\\.user_uploaded\\media_1788961879104.png';

  let sourcePath = banner1;
  if (id === '2') sourcePath = banner2;
  else if (id === '3' || id === 'mijia') sourcePath = banner3;
  else if (id === '4' || id === 'catalog') sourcePath = banner4;

  if (fs.existsSync(sourcePath)) {
    const fileBuffer = fs.readFileSync(sourcePath);
    if (searchParams.get('info')) {
      const width = fileBuffer.readUInt32BE(16);
      const height = fileBuffer.readUInt32BE(20);
      return NextResponse.json({ width, height });
    }
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // Fallback to whichever is available
  if (fs.existsSync(banner1)) {
    return new NextResponse(fs.readFileSync(banner1), {
      headers: { 'Content-Type': 'image/png' },
    });
  }

  return new NextResponse('Image not found', { status: 404 });
}
